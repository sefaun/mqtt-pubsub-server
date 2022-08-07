import { Socket } from "net"
import { v4 as uuidv4 } from "uuid"
import { RequestOptions } from "http"
import { EventEmitter } from "events"

import { Client } from "./client"
import { Qlobber, QlobSignals } from "./Qlobber"


export class MQTTPubSub extends EventEmitter {

  clients: object = {}
  seperator: QlobSignals
  qlobber: Qlobber

  constructor() {
    super()

    this.seperator = "/"
    this.qlobber = new Qlobber(this.seperator)
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