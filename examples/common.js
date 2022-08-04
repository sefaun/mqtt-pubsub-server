const { MQTTPubSub } = require("../build/index.js")
const broker = new MQTTPubSub()

const net = require("net")
const httpServer = require("http").createServer()
const server = net.createServer(broker.serverHandler)
require('websocket-stream').createServer({ server: httpServer }, broker.serverHandler)


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


server.listen(5000, () => console.log("TCP Server Running !"))
httpServer.listen(5001, () => console.log("WebSocket Server Running !"))