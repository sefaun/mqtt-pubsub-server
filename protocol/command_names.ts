export const command_names = {
  connect: "connect",
  connack: "connack",
  publish: "publish",
  puback: "puback",
  pubrec: "pubrec",
  pubrel: "pubrel",
  pubcomp: "pubcomp",
  subscribe: "subscribe",
  suback: "suback",
  unsubscribe: "unsubscribe",
  unsuback: "unsuback",
  pingreq: "pingreq",
  pingresp: "pingresp",
  disconnect: "disconnect"
}

export const command_first_byte = {
  connect: 16, //0x10
  connack: 32, //0x20
  publish: 48, //0x30
  puback: 64, //0x40
  pubrec: 80, //0x50
  pubrel: 98, //0x62
  pubcomp: 112, //0x70
  subscribe: 130, //0x82
  suback: 144, //0x90
  unsubscribe: 162, //0xA2
  unsuback: 176, //0xB0
  pingreq: 192, //0xC0
  pingresp: 208, //0xD0
  disconnect: 224, //0xE0
}