import mqtt from "mqtt"

const client = mqtt.connect({ host: "localhost", port: 5000 })

client.on("connect", (packet) => {
  console.log("bağlandı")
  client.publish("sefa", "veri")
})