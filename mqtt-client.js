"use strict";
exports.__esModule = true;
var mqtt_1 = require("mqtt");
var client = mqtt_1.connect({ host: "localhost", port: 5000 });
client.on("connect", function (packet) {
    console.log("bağlandı");
    client.subscribe("sefa");
    client.publish("sefa", "veri");
});

client.on("message", (topic, payload) => {
    console.log(topic, payload.toString())
})
