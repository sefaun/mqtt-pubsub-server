const net = require('net')

const {mqtt} = require('./build/index')

console.log(mqtt)
const server = net.createServer(mqtt.handle)

server.on('connection', client => {
  console.log(client)
})
server.listen(3333, () => {
  console.log("sdsdf", server._id)
})