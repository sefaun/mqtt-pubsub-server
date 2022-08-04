"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTPubSub = void 0;
const events_1 = require("events");
const uuid_1 = require("uuid");
const client_1 = require("./client");
class MQTTPubSub extends events_1.EventEmitter {
    constructor() {
        super();
        this.clients = {};
        this.serverHandler = (client, req) => {
            this.setMaxListeners(200);
            const client_id = (0, uuid_1.v4)();
            const client_class = new client_1.Client(this, client, client_id, req);
            client_class.NewClient();
            this.clients[client_id] = client_class;
        };
        this.deleteClientClass = (client_id) => {
            delete this.clients[client_id];
        };
    }
}
exports.MQTTPubSub = MQTTPubSub;
//# sourceMappingURL=index.js.map