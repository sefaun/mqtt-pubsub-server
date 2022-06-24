import net, { Socket } from "net"
import { EventEmitter } from "events"
import mqtt_packet from "mqtt-packet"

import { command_names } from "./protocol/command_names"
import { responses } from "./protocol/responses"

var clients: number = 0

class Client extends EventEmitter {

  constructor() {
    super()
    this.setMaxListeners(0)
  }

  sendResponse = (client: Socket, data: Buffer) => {
    client.write(data)
  }

  operations = (client: Socket, data: Buffer) => {

    const packet_generator = mqtt_packet.parser({ protocolVersion: 4 })

    packet_generator.on("packet", (packet: any) => {

      switch (packet.cmd) {

        case command_names.connect:
          this.sendResponse(client, Buffer.from(responses.connack))
          break

        case command_names.subscribe:
          this.addListener(packet.subscriptions[0].topic, function (data) {
            client.write(data)
          })
          this.sendResponse(client, Buffer.from(responses.suback))
          break

        case command_names.publish:
          this.emit(packet.topic, mqtt_packet.generate(packet))
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
      console.log(error, "packet hatası")
    })

    packet_generator.parse(data)

  }

  newClient = (client: Socket, that: any) => {

    client.on("data", (data: Buffer) => {
      this.operations(client, data)
    })

    client.on('error', (_err: Error) => {
      //this.removeAllListeners()
      //console.log("err !", err)
    })

  }

  BrokerDataLogger = (data: object) => {
    this.emit("broker-data", data);
  }

  protocolError = (client: Socket) => {
    client.write("MQTT Protocol Error !\r\n")
    return client.destroy()
  }

}

type Commands = {
  [key: string]: {
    subscription: Array<string>
  }
}

export class SefaBroker extends Client {

  events: Commands = {}
  client_no: number

  constructor() {
    super()
  }

  serverHandler = (client: Socket) => {
    clients++

    var that = {} as any
    that.events = this.events[clients] = { subscription: [] }
    that.client_no = clients

    this.newClient(client, that)

  }

}

const server = net.createServer(new SefaBroker().serverHandler)

server.listen(5000, () => console.log("Server Running !"))