export declare type QoS = 0 | 1 | 2

export declare type PacketName =
  'auth' |
  'connack' |
  'connect' |
  'disconnect' |
  'pingreq' |
  'pingresp' |
  'puback' |
  'pubcomp' |
  'publish' |
  'pubrel' |
  'pubrec' |
  'suback' |
  'subscribe' |
  'unsuback' |
  'unsubscribe'

export interface IPacket {
  cmd: PacketName
  messageId?: number
  length?: number
}

export interface IConnectPacket extends IPacket {
  cmd: 'connect'
  clientId: string
  protocolVersion?: 4
  protocolId?: 'MQTT'
  clean?: boolean
  keepalive?: number
  username?: string
  password?: Buffer
}

export interface IPublishPacket extends IPacket {
  cmd: 'publish'
  qos: QoS
  dup: boolean
  retain: boolean
  topic: string
  payload: string | Buffer
}

export interface IConnackPacket extends IPacket {
  cmd: 'connack'
  returnCode?: number,
  reasonCode?: number,
  sessionPresent: boolean
}