import net, { Socket } from "net"
import { EventEmitter } from "events"
import mqtt_packet from "mqtt-packet"

import { command_names } from "./protocol/command_names"
import { responses } from "./protocol/responses"


class Client extends EventEmitter {

  constructor() {
    super()
    this.setMaxListeners(0)
  }

  sendResponse = (client: Socket, data: any) => {
    client.write(data)
  }

  operations = (client: Socket, data: Buffer) => {

    const packet_generator = mqtt_packet.parser({ protocolVersion: 4 })

    packet_generator.on("packet", (packet: any) => {
      //console.log(packet)

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
      console.log(error, "packet hatası")
    })

    packet_generator.parse(data)

  }

  serverHandler = (client: Socket) => {

    client.on("data", (data: Buffer) => {
      this.operations(client, data)
    })

    client.on('error', (_err: Error) => {
      //this.removeAllListeners()
      //console.log("err !", err)
    })

  }

  protocolError = (client: Socket) => {
    client.write("MQTT Protocol Error !\r\n")
    return client.destroy()
  }

}


const server = net.createServer(new Client().serverHandler)

server.listen(5000, () => console.log("Server Running !"))