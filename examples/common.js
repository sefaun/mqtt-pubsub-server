const { MQTTPubSub } = require("../build/index.js")
const broker = new MQTTPubSub()

const net = require("net")
const httpServer = require("http").createServer()
const server = net.createServer(broker.serverHandler)
require('websocket-stream').createServer({ server: httpServer }, broker.serverHandler)


broker.on("new-client", (client, data) => {
  console.log(client, data, "new-client")
})

broker.on("broker-publish", (data) => {
  console.log(data, "broker-publish")
})

broker.on("broker-subscribe", (data) => {
  console.log(data, "broker-subscribe")
})

broker.on("client-disconnect", (client) => {
  console.log(client, "client-disconnect")
})

broker.on("client-socket-error", (client, error) => {
  console.log(client, error, "client-socket-error")
})

broker.on("client-protocol-error", (client, error) => {
  console.log(client, error, "client-protocol-error")
})


server.listen(5000, () => console.log("TCP Server Running !"))
httpServer.listen(5001, () => console.log("WebSocket Server Running !"))