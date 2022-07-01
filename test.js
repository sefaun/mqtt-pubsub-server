var net = require("net")
var { MQTTPubSub } = require("./build/index.js")


const broker = new MQTTPubSub()

broker.on("broker-publish", (data) => {
  console.log(data, "veri geldi")
})

broker.on("broker-subscribe", (data) => {
  console.log(data, "sub geldi")
})

const server = net.createServer(broker.serverHandler)

server.listen(5000, () => console.log("Server Running !"))