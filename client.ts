import { Socket } from "net"
import { RequestOptions } from "http"
import EventEmitter from "events"
import mqtt_packet from "mqtt-packet"

import { command_first_byte, command_names } from "./protocol/command_names"
import { responses } from "./protocol/responses"


export class Client {

  broker: any
  server_client: Socket
  client_id: string
  client_auth: boolean
  sub_events: string[]
  keep_alive: ReturnType<typeof setTimeout>
  keep_alive_time: number
  req: RequestOptions
  telemetry: Buffer
  telemetry_length: number
  telemetry_length_value: number
  telemetry_backup: Buffer
  data_counter: number

  constructor(that: EventEmitter, client: Socket, client_id: string, req: RequestOptions) {
    this.broker = that
    this.server_client = client
    this.client_id = client_id
    this.client_auth = false
    this.sub_events = []
    this.req = req
    this.telemetry = null
    this.telemetry_length = 0
    this.telemetry_length_value = 0
    this.telemetry_backup = null
    this.data_counter = 0
  }

  public NewClient = (): void => {
    this.server_client.on('data', (data: Buffer) => {

      if (!this.telemetry) {
        this.telemetry = data
        this.telemetry_length = this.telemetry.length
      } else {
        this.telemetry = Buffer.concat([this.telemetry, data])
        this.telemetry_length = this.telemetry.length
      }

      return this.DataFetcher()
    })

    this.server_client.on('error', (error: Error) => {
      this.DeleteSubEventsFromEmitter()
      this.ClientSocketErrorLogger(error)
    })
  }

  private DataFetcher = () => {
    if (this.telemetry.length === 2 || this.telemetry.length === 4 || this.telemetry.length >= 5) {
      //First Byte Control
      if (!this.MQTTFirstByteControl(Number(this.telemetry[0]))) {
        this.ProtocolError(new Error('Invalid MQTT Packet !'))
        return this.ClientDestroy()
      }

      this.telemetry_length_value = this.MQTTPacketLengthControl(this.telemetry)

      if (this.telemetry_length > this.telemetry_length_value) {
        this.data_counter++

        const packet = this.telemetry.slice(0, this.telemetry_length_value)
        this.telemetry_backup = this.telemetry.slice(this.telemetry_length_value, this.telemetry_length)

        this.telemetry = this.telemetry_backup
        this.telemetry_length = this.telemetry.length

        if (!this.client_auth && this.data_counter > 1) {
          this.ProtocolError(new Error('Client Authorization Error !'))
          return this.ClientDestroy()
        } else {
          this.Operations(packet)
          return this.DataFetcher()
        }
      } else if (this.telemetry_length === this.telemetry_length_value) {
        this.data_counter++

        if (!this.client_auth && this.data_counter > 1) {
          this.ProtocolError(new Error('Client Authorization Error !'))
          return this.ClientDestroy()
        } else {
          this.Operations(this.telemetry)
        }
        this.telemetry = null
        this.telemetry_backup = null
        this.telemetry_length = 0
      }
    }
  }

  private MQTTPacketLengthControl = (data: Buffer): number => {
    let packet_length = Number(data[1])

    if (data[1] > 127) {
      packet_length = Number((data[1] * 256) + data[2])
      if (data[1] > 127 && data[2] > 127) {
        packet_length = Number((data[1] * 256 * 256) + (data[2] * 256) + data[3])
        if (data[1] > 127 && data[2] > 127 && data[3] > 127) {
          packet_length = Number((data[1] * 256 * 256 * 256) + (data[2] * 256 * 256) + (data[3] * 256) + data[4])
        }
      }
    }

    return packet_length + 2
  }

  private MQTTFirstByteControl = (mqtt_command: number): boolean => {
    switch (Number(mqtt_command)) {
      case command_first_byte.connect:
        return true
      case command_first_byte.connack:
        return true
      case command_first_byte.publish:
        return true
      case command_first_byte.puback:
        return true
      case command_first_byte.pubrec:
        return true
      case command_first_byte.pubrel:
        return true
      case command_first_byte.pubcomp:
        return true
      case command_first_byte.subscribe:
        return true
      case command_first_byte.suback:
        return true
      case command_first_byte.unsubscribe:
        return true
      case command_first_byte.unsuback:
        return true
      case command_first_byte.pingreq:
        return true
      case command_first_byte.pingresp:
        return true
      case command_first_byte.disconnect:
        return true
      default:
        return false
    }
  }

  private SendResponse = (data: Buffer): void => {
    this.server_client.write(data)
  }

  private SendEventResponse = (data: Buffer): void => {
    this.server_client.write(data)
  }

  //MQTT Protocols
  private ClientConnect = (packet: any): void => {
    this.client_auth = true
    this.SendResponse(Buffer.from(responses.connack))
    this.keep_alive_time = packet.keepalive || 60
    this.ClientKeepAliveController()
    this.NewClientLogger(packet)
  }

  private ClientPublish = (packet: any): void => {
    const publish_data = mqtt_packet.generate(packet)

    if (!this.ClientPublishTopicControl(packet.topic)) {
      this.broker.emit(packet.topic, publish_data)
      this.BrokerPublishLogger(publish_data)
    } else {
      this.ProtocolError(new Error(`Invalid Topic: ${packet.topic}`))
    }
  }

  private ClientSubscribe = (packet: any): void => {
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
    }, (this.keep_alive_time * 1000) + 5000);
  }

  private ClientDestroy = (): void => {
    this.server_client.destroy()
    this.broker.deleteClientClass(this.client_id)
  }

  private ClientPublishTopicControl = (data: string): boolean => {
    if (data.indexOf("+") !== -1 || data.indexOf("#") !== -1) {
      return true
    }
    return false
  }

  private Operations = (data: Buffer): void => {
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
          this.ClientDisconnectLogger()
          this.ClientDestroy()
          break
      }
    })

    packet_generator.on("error", (error) => {
      this.ProtocolError(error)
    })

    packet_generator.parse(data)
  }

  private ProtocolError = (error: Error): void => {
    this.ClientProtocolErrorLogger(error)
  }

  private DeleteSubEventsFromEmitter = (): void => {
    this.sub_events.forEach((event) => {
      this.broker.removeListener(event, this.SendEventResponse)
    })
    this.sub_events = []
  }

  //Client Loggers
  private NewClientLogger = (data: object): void => {
    this.broker.emit("new-client", this.server_client, data)
  }

  private ClientDisconnectLogger = (): void => {
    this.broker.emit("client-disconnect", this.server_client)
  }

  private ClientSocketErrorLogger = (error: Error): void => {
    this.broker.emit("client-socket-error", this.server_client, error)
    this.broker.deleteClientClass(this.client_id)
  }

  private ClientProtocolErrorLogger = (error: Error): void => {
    this.broker.emit("client-protocol-error", this.server_client, error)
  }

  //Broker Loggers
  private BrokerPublishLogger = (data: object): void => {
    this.broker.emit("broker-publish", data)
  }

  private BrokerSubscribeLogger = (data: object): void => {
    this.broker.emit("broker-subscribe", data)
  }

}