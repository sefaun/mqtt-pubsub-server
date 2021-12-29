import * as Socket from 'net'
import EventEmitter from 'events'

import { Client } from './client'

export interface MqttBroker extends EventEmitter {
  _id: Readonly<string>,
  connectedClients: Readonly<number>,

  handle: (stream: Socket.Socket) => Client
}