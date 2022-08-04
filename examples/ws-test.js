const server = require("http").createServer()
const { MQTTPubSub } = require("../build/index.js")

const broker = new MQTTPubSub()
require('websocket-stream').createServer({ server }, broker.serverHandler)


broker.on("new-client", (client, data) => {
  console.log(client, data, "new-client")
})

broker.on("client-publish", (data) => {
  console.log(data, "broker-publish")
})

broker.on("client-subscribe", (data) => {
  console.log(data, "broker-subscribe")
})

broker.on("client-errors", (client, error_type, error) => {
  console.log(client, error_type.client, error_type.disconnect, error_type.protocol, error_type.error, error, "client-errors")
})


server.listen(5000, () => console.log("Server Running !"))