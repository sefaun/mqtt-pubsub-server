import { Socket } from "net"
import { EventEmitter } from "events"
import mqtt_packet from "mqtt-packet"

import { command_names } from "./protocol/command_names"
import { responses } from "./protocol/responses"


class Client {

  server_client: Socket
  user_auth: boolean
  data_counter: number
  sub_events: string[]
  broker: any

  constructor(that: EventEmitter, client: Socket) {
    this.broker = that
    this.server_client = client
    this.user_auth = false
    this.data_counter = 0
    this.sub_events = []
  }

  newClient = () => {
    this.server_client.on("data", (data: Buffer) => {
      this.data_counter++

      if (this.user_auth === false && this.data_counter > 1) {
        this.protocolError()
      } else {
        this.operations(data)
      }

    })

    this.server_client.on('error', (_err: Error) => {
      this.deleteSubEventsFromEmitter()
    })
  }

  private sendResponse = (data: Buffer) => {
    this.server_client.write(data)
  }

  private sendEventResponse = (data: Buffer) => {
    this.server_client.write(data)
  }

  private operations = (data: Buffer) => {
    const packet_generator = mqtt_packet.parser({ protocolVersion: 4 })

    packet_generator.on("packet", (packet: any) => {

      switch (packet.cmd) {

        case command_names.connect:
          this.user_auth = true
          this.sendResponse(Buffer.from(responses.connack))
          break

        case command_names.subscribe:
          this.sub_events.push(packet.subscriptions[0].topic)

          this.broker.addListener(packet.subscriptions[0].topic, this.sendEventResponse)
          this.sendResponse(Buffer.from(responses.suback))

          this.BrokerSubscribeLogger(packet)
          break

        case command_names.publish:
          const publish_data = mqtt_packet.generate(packet)
          this.broker.emit(packet.topic, publish_data)
          this.BrokerPublishLogger(publish_data)
          break

        //Pingreq Packet Control
        case command_names.pingreq:
          //Send Pingresp Packet
          this.sendResponse(Buffer.from(responses.pingresp))
          break

        //Disconnect Packet Control
        case command_names.disconnect:
          //Kill Client
          this.server_client.destroy()
          break

        default:
          this.protocolError()
          break
      }
    })

    packet_generator.on("error", (error) => {
      this.protocolError()
      console.log(error, "packet error")
    })

    packet_generator.parse(data)
  }

  private BrokerPublishLogger = (data: object) => {
    this.broker.emit("broker-publish", data);
  }

  private BrokerSubscribeLogger = (data: object) => {
    this.broker.emit("broker-subscribe", data);
  }

  private protocolError = () => {
    this.server_client.write("MQTT Protocol Error !\r\n")
    return this.server_client.destroy()
  }

  private deleteSubEventsFromEmitter = () => {
    const sub_event_backup = [...this.sub_events]

    sub_event_backup.forEach((event, index) => {
      this.broker.removeListener(event, this.sendEventResponse)
      this.sub_events.splice(index, 1)
    })
  }

}


export class MQTTPubSub extends EventEmitter {

  constructor() {
    super()
  }

  serverHandler = (client: Socket) => {
    this.setMaxListeners(200)

    return new Client(this, client).newClient()
  }

}