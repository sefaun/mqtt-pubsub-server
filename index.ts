import net, { Socket } from "net"
import { EventEmitter } from "events"
import { v4 as uuidv4 } from "uuid"

import { Client } from "./client"


export class MQTTPubSub extends EventEmitter {

  clients: object = {}

  constructor() {
    super()
  }

  serverHandler = (client: Socket) => {
    this.setMaxListeners(200)

    const client_id = uuidv4()
    this.clients[client_id] = {}

    return new Client(this, client, client_id).NewClient()
  }

}