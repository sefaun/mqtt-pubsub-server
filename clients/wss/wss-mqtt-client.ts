import mqtt from "mqtt"
import fs from "fs"

const client = mqtt.connect("wss://localhost:5000", {
  key: fs.readFileSync('../../private-key.pem'),
  cert: fs.readFileSync('../../public-cert.pem'),
  rejectUnauthorized: false
})

client.on("connect", (packet) => {
  console.log("connected");
  client.subscribe("sefa");
  client.publish("sefa", "veri");
});

client.on("message", (topic, payload) => {
  console.log(topic, payload.toString())
})
