export const commands = {
  16: "connect",
  32: "connack",
  48: "publish",
  //50: "publish",
  //52: "publish",
  64: "puback",
  80: "pubrec",
  98: "pubrel",
  112: "pubcomp",
  130: "subscribe",
  144: "suback",
  162: "unsubscribe",
  176: "unsuback",
  192: "pingreq",
  208: "pingresp",
  224: "disconnect"
} as Commands

interface Commands {
  [key: number]: string
}