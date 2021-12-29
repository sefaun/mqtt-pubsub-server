import { EventEmitter } from "events";
import { Socket } from "net";

export interface Client extends EventEmitter {
  _id: string,
  connection: Socket,
  connected: Readonly<boolean>,
  closed: Readonly<boolean>

  on(event: 'connected', listener: () => void): this
  on(event: 'error', listener: (error: Error) => void): this
}