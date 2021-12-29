import Socket from 'net'

import { mqtt } from './mqtt-broker'

const server = Socket.createServer(mqtt.handle)

server.on("connection", (socket) => {

})

server.listen(3000, () => {
  console.log("broker aktif")
})