import { Socket } from "net"
import { RequestOptions } from "http"
import { EventEmitter } from "events"
import { v4 as uuidv4 } from "uuid"

import { Client } from "./client"


export class MQTTPubSub extends EventEmitter {

  clients: object = {}

  constructor() {
    super()
  }

  serverHandler = (client: Socket, req: RequestOptions) => {
    this.setMaxListeners(200)

    const client_id = uuidv4()

    const client_class = new Client(this, client, client_id, req)
    client_class.NewClient()

    this.clients[client_id] = client_class
  }

  deleteClientClass = (client_id: string) => {
    delete this.clients[client_id]
  }

}