"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const client = mqtt_1.default.connect("ws://localhost:5000");
client.on("connect", (packet) => {
    console.log("connected");
    client.subscribe("sefa");
    client.publish("sefa", "veri");
});
client.on("message", (topic, payload) => {
    console.log(topic, payload.toString());
});
//# sourceMappingURL=ws-mqtt-client.js.map