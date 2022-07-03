import mqtt from "mqtt"

const client = mqtt.connect({ host: "localhost", port: 5000 })

client.on("connect", (packet) => {
  console.log("connected");
  client.subscribe("sefa");
  client.publish("sefa", "veri");
});

client.on("message", (topic, payload) => {
  console.log(topic, payload.toString())
})
