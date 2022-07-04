"use strict";
exports.__esModule = true;
var mqtt_1 = require("mqtt");

var client = mqtt_1.connect("ws://localhost:5000");

client.on("connect", function (packet) {
    console.log("connected");
    client.subscribe("sefa");
    client.publish("sefa", "veri");
});

client.on("message", function (topic, payload) {
    console.log(topic, payload.toString());
});
