import { Socket } from "net"
import EventEmitter from "events"
import mqtt_packet from "mqtt-packet"

import { command_names } from "./protocol/command_names"
import { responses } from "./protocol/responses"


export class Client {

  broker: any
  server_client: Socket
  client_id: string
  user_auth: boolean
  data_counter: number
  sub_events: string[]
  keep_alive: ReturnType<typeof setTimeout>;
  keep_alive_time: number;

  constructor(that: EventEmitter, client: Socket, client_id: string) {
    this.broker = that
    this.server_client = client
    this.client_id = client_id
    this.user_auth = false
    this.data_counter = 0
    this.sub_events = []
  }

  public NewClient = (): void => {
    this.server_client.on("data", (data: Buffer) => {
      this.data_counter++

      if (this.user_auth === false && this.data_counter > 1) {
        this.ProtocolError(new Error(`Client Authorization Error !`))
      } else {
        this.Operations(data)
      }

    })

    this.server_client.on('error', (error: Error) => {
      this.DeleteSubEventsFromEmitter()
      this.ClientSocketErrorLogger(error)
    })
  }

  private SendResponse = (data: Buffer) => {
    this.server_client.write(data)
  }

  private SendEventResponse = (data: Buffer) => {
    this.server_client.write(data)
  }

  //MQTT Protocols
  private ClientConnect = (packet: any) => {
    this.user_auth = true
    this.SendResponse(Buffer.from(responses.connack))
    this.keep_alive_time = packet.keepalive || 60
    this.ClientKeepAliveController()
    this.NewClientLogger(packet)
  }

  private ClientPublish = (packet: any) => {
    const publish_data = mqtt_packet.generate(packet)

    if (!this.ClientPublishTopicControl(packet.topic)) {
      this.broker.emit(packet.topic, publish_data)
      this.BrokerPublishLogger(publish_data)
    } else {
      this.ProtocolError(new Error(`Invalid Topic: ${packet.topic}`))
    }
  }

  private ClientSubscribe = (packet: any) => {
    this.sub_events.push(packet.subscriptions[0].topic)

    this.broker.addListener(packet.subscriptions[0].topic, this.SendEventResponse)
    this.SendResponse(Buffer.from(responses.suback))

    this.BrokerSubscribeLogger(packet)
  }

  private ClientPingreq = (): void => {
    this.SendResponse(Buffer.from(responses.pingresp))
    this.ClientKeepAliveController()
  }

  private ClientDisconnect = (): void => {
    this.ClientDestroy()
    this.ClientDisconnectLogger()
  }

  private ClientKeepAliveController = (): void => {
    clearTimeout(this.keep_alive)
    this.keep_alive = setTimeout(() => {
      this.DeleteSubEventsFromEmitter()
      this.ClientDisconnectLogger()
      this.ClientDestroy()
    }, this.keep_alive_time * 1000);
  }

  private ClientDestroy = (): void => {
    this.server_client.destroy()
  }

  private ClientPublishTopicControl = (data: string): boolean => {
    if (data.indexOf("+") !== -1 || data.indexOf("#") !== -1) {
      return true
    }
    return false
  }

  private Operations = (data: Buffer) => {
    const packet_generator = mqtt_packet.parser({ protocolVersion: 4 })

    packet_generator.on("packet", (packet: any) => {

      switch (packet.cmd) {

        //Connect Packet Control
        case command_names.connect:
          this.ClientConnect(packet)
          break

        //Subscribe Packet Control
        case command_names.subscribe:
          this.ClientSubscribe(packet)
          break

        //Publish Packet Control
        case command_names.publish:
          this.ClientPublish(packet)
          break

        //Pingreq Packet Control
        case command_names.pingreq:
          this.ClientPingreq()
          break

        //Disconnect Packet Control
        case command_names.disconnect:
          this.ClientDisconnect()
          break

        default:
          this.ProtocolError(new Error('Unknown Protocol'))
          this.ClientDestroy()
          this.ClientDisconnectLogger()
          break
      }
    })

    packet_generator.on("error", (error) => {
      this.ProtocolError(error)
    })

    packet_generator.parse(data)
  }

  private ProtocolError = (error: Error) => {
    this.ClientProtocolErrorLogger(error)
  }

  private DeleteSubEventsFromEmitter = (): void => {
    this.sub_events.forEach((event) => {
      this.broker.removeListener(event, this.SendEventResponse)
    })
    this.sub_events = []
  }

  //Client Logger
  private NewClientLogger = (data: object): void => {
    this.broker.emit("new-client", this.server_client, data)
  }

  private ClientDisconnectLogger = (): void => {
    this.broker.emit("client-disconnect", this.server_client)
  }

  private ClientSocketErrorLogger = (error: Error): void => {
    this.broker.emit("client-socket-error", this.server_client, error)
  }

  private ClientProtocolErrorLogger = (error: Error) => {
    this.broker.emit("client-protocol-error", this.server_client, error)
  }

  //Broker Logger
  private BrokerPublishLogger = (data: object) => {
    this.broker.emit("broker-publish", data)
  }

  private BrokerSubscribeLogger = (data: object) => {
    this.broker.emit("broker-subscribe", data)
  }

}