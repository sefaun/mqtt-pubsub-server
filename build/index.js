"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MQTTPubSub = void 0;
const uuid_1 = require("uuid");
const events_1 = require("events");
const client_1 = require("./client");
const Qlobber_1 = require("./Qlobber");
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
        this.seperator = "/";
        this.qlobber = new Qlobber_1.Qlobber(this.seperator);
    }
}
exports.MQTTPubSub = MQTTPubSub;
//# sourceMappingURL=index.js.map