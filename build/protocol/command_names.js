"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.command_first_byte = exports.command_names = void 0;
exports.command_names = {
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
};
exports.command_first_byte = {
    connect: 16,
    connack: 32,
    publish: 48,
    puback: 64,
    pubrec: 80,
    pubrel: 98,
    pubcomp: 112,
    subscribe: 130,
    suback: 144,
    unsubscribe: 162,
    unsuback: 176,
    pingreq: 192,
    pingresp: 208,
    disconnect: 224, //0xE0
};
//# sourceMappingURL=command_names.js.map