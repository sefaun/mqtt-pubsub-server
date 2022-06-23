import net, { Socket } from "net"
import { EventEmitter } from "events"

import { command_names } from "./protocol/command_names"
import { commands } from "./protocol/commands"
import { responses } from "./protocol/responses"


class Client extends EventEmitter {

  constructor() {
    super()
    this.setMaxListeners(0)
  }

  calculatePaketLength = (data: Buffer) => {
    let packet = {
      length: 0,
      value: data[1]
    }

    if (data[1] > 127) {

      packet.length = 1
      packet.value = (data[1] * 256) + data[2]

      if (data[1] > 127 && data[2] > 127) {

        packet.length = 2
        packet.value = (data[1] * 256 * 256) + (data[2] * 256) + data[3]

        if (data[1] > 127 && data[2] > 127 && data[3] > 127) {

          packet.length = 3
          packet.value = (data[1] * 256 * 256 * 256) + (data[2] * 256 * 256) + (data[3] * 256) + data[4]

        }
      }
    }

    return packet
  }

  operations = (client: Socket, data: Buffer) => {

    const packet = this.calculatePaketLength(data)
    console.log(commands[data[0]])
    switch (commands[data[0]]) {

      //Connection Packet Control
      case command_names.connect:

        if (data.slice(4, 8).toString() !== "MQTT") {
          return this.protocolError(client)
        }
        //Send Connack Packet
        client.write(Buffer.from(responses.connack))
        break


      //Subscribe Data Control
      case command_names.subscribe:
        const subscribe_event_length = (data[packet.length + 4] * 256) + data[packet.length + 5]
        const subscribe_event = data.slice(packet.length + 6, packet.length + subscribe_event_length + 6)
        //TODO: listener eklenecek
        this.addListener(subscribe_event.toString(), function (data) {
          console.log('First subscriber: ' + data)
          client.write(data)
        })
        //Send Datas to Clients
        client.write(Buffer.from(responses.suback))
        break


      //Publish Packet Control
      case command_names.publish:
        const sub_event_length = (data[packet.length + 2] * 256) + data[packet.length + 3]
        const sub_event = data.slice(packet.length + 4, packet.length + sub_event_length + 4)
        const publish_data = data.slice(packet.length + 4 + Number(sub_event), data.length)
        //Send Data
        this.emit(sub_event.toString(), publish_data)
        break


      //Pingreq Packet Control
      case command_names.pingreq:
        //Send Pingresp Packet
        client.write(Buffer.from(responses.pingresp))
        break

      //Disconnect Packet Control
      case command_names.disconnect:
        //Kill Client
        client.destroy()
        break

      default:
        client.write("MQTT Protocol Error !\r\n")
        client.destroy()
        break;
    }

  }

  serverHandler = (client: Socket) => {

    client.on("data", (data: Buffer) => {
      this.operations(client, data)
    })

    client.on('error', (_err: Error) => {
      this.removeAllListeners()
      //console.log(this.listenerCount("sefa"))
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

