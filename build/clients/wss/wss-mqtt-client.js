"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const fs_1 = __importDefault(require("fs"));
const client = mqtt_1.default.connect("wss://localhost:5000", {
    key: fs_1.default.readFileSync('../../private-key.pem'),
    cert: fs_1.default.readFileSync('../../public-cert.pem'),
    rejectUnauthorized: false
});
client.on("connect", (packet) => {
    console.log("connected");
    client.subscribe("sefa");
    client.publish("sefa", "veri");
});
client.on("message", (topic, payload) => {
    console.log(topic, payload.toString());
});
//# sourceMappingURL=wss-mqtt-client.js.map