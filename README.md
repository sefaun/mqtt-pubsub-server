## MQTT Pub/Sub Server

This server can not support all of MQTT Protocol features. Just supporting event messaging right now.

Unsupport features of MQTT Protocol
 * QOS
 * Retain
 * Dup

Unsupporting event messaging yet
  * `.../+` subscription not support yet
  * `.../#` subscription not support yet

## Code Example For TCP Socket
```js
const net = require("net")
const { MQTTPubSub } = require("./build/index.js")

const broker = new MQTTPubSub()
const server = net.createServer(broker.serverHandler)


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

broker.on("client-error", (client, error) => {
  console.log(client, error, "client-error")
})


server.listen(5000, () => console.log("Server Running !"))
```

## Code Example For TLS Socket
```js
const tls = require("tls")
const fs = require("fs")

const { MQTTPubSub } = require("./build/index.js")

const ssl = {
  key: fs.readFileSync('./private-key.pem'),
  cert: fs.readFileSync('./public-cert.pem')
}

const broker = new MQTTPubSub()
const server = tls.createServer(ssl, broker.serverHandler)


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

broker.on("client-error", (client, error) => {
  console.log(client, error, "client-error")
})


server.listen(5000, () => console.log("Server Running !"))
```