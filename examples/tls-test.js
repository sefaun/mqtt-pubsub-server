const tls = require("tls")
const fs = require("fs")

const { MQTTPubSub } = require("../build/index.js")

const ssl = {
  key: fs.readFileSync('../private-key.pem'),
  cert: fs.readFileSync('../public-cert.pem')
}

const broker = new MQTTPubSub()
const server = tls.createServer(ssl, broker.serverHandler)


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