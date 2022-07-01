import net, { Socket } from "net"
import { EventEmitter } from "events"
import mqtt_packet from "mqtt-packet"

import { command_names } from "./protocol/command_names"
import { responses } from "./protocol/responses"


class Client {

  user_auth: boolean
  data_counter: number
  sub_events: string[]
  broker: EventEmitter

  constructor(that: EventEmitter) {
    this.broker = that
    this.user_auth = false
    this.data_counter = 0
    this.sub_events = []
  }

  private sendResponse = (client: Socket, data: Buffer) => {
    client.write(data)
  }

  private operations = (client: Socket, data: Buffer) => {

    const packet_generator = mqtt_packet.parser({ protocolVersion: 4 })

    packet_generator.on("packet", (packet: any) => {

      switch (packet.cmd) {

        case command_names.connect:
          this.user_auth = true
          this.sendResponse(client, Buffer.from(responses.connack))
          break

        case command_names.subscribe:
          this.sub_events.push(packet.subscriptions[0].topic)

          this.broker.on(packet.subscriptions[0].topic, function (data) {
            client.write(data)
          })
          this.sendResponse(client, Buffer.from(responses.suback))

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
          this.sendResponse(client, Buffer.from(responses.pingresp))
          break

        //Disconnect Packet Control
        case command_names.disconnect:
          //Kill Client
          client.destroy()
          break

        default:
          this.protocolError(client)
          break
      }
    })

    packet_generator.on("error", (error) => {
      this.protocolError(client)
      console.log(error, "packet error")
    })

    packet_generator.parse(data)

  }

  newClient = (client: Socket) => {

    client.on("data", (data: Buffer) => {
      this.data_counter++

      if (this.user_auth === false && this.data_counter > 1) {
        this.protocolError(client)
      } else {
        this.operations(client, data)
      }

    })

    client.on('error', (_err: Error) => {
      this.deleteSubEventsFromEmitter()
    })

  }

  private BrokerPublishLogger = (data: object) => {
    this.broker.emit("broker-publish", data);
  }

  private BrokerSubscribeLogger = (data: object) => {
    this.broker.emit("broker-subscribe", data);
  }

  private protocolError = (client: Socket) => {
    client.write("MQTT Protocol Error !\r\n")
    return client.destroy()
  }

  private deleteSubEventsFromEmitter = () => {
    console.log(this.sub_events)
    this.sub_events.forEach(event => {
      this.broker.removeListener(event, this.noob)
      console.log(this.broker.listenerCount(event))
    })
  }

  private noob = () => { }

}


export class MQTTPubSub extends EventEmitter {

  constructor() {
    super()
  }

  serverHandler = (client: Socket) => {
    this.setMaxListeners(0)

    return new Client(this).newClient(client)

  }

}

const server = net.createServer(new MQTTPubSub().serverHandler)

server.listen(5000, () => console.log("Server Running !"))