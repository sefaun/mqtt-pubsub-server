"use strict";
exports.__esModule = true;
var mqtt_1 = require("mqtt");
var fs_1 = require("fs");

var client = mqtt_1.connect({
    protocol: "mqtts",
    host: "localhost",
    port: 5000,
    key: fs_1.readFileSync('../../private-key.pem'),
    cert: fs_1.readFileSync('../../public-cert.pem'),
    rejectUnauthorized: false,
    keepalive: 10
});

client.on("connect", function (packet) {
    console.log("connected");
    client.subscribe("sefa");
    client.publish("sefa", "veri");
});

client.on("message", function (topic, payload) {
    console.log(topic, payload.toString());
});
