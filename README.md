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
```

## Code Example For WS - WebSocket
```js
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
```

## Code Example For WSS - TLS WebSocket
```js
const fs = require("fs")
const ssl = {
  key: fs.readFileSync('../private-key.pem'),
  cert: fs.readFileSync('../public-cert.pem')
}
const server = require("https").createServer({ ...ssl })
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
```

## Code Example For TCP and WebSocket Server
```js
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
```