var net = require("net")
var { SefaBroker } = require("./build/index.js")


const broker = new SefaBroker()

broker.on("broker-publish", (data) => {
  console.log(data, "veri geldi")
})

broker.on("broker-subscribe", (data) => {
  console.log(data, "sub geldi")
})

const server = net.createServer(broker.serverHandler)

server.listen(5000, () => console.log("Server Running !"))