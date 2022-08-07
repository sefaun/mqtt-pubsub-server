/// <reference types="node" />
import { Socket } from "net";
import { RequestOptions } from "http";
import { EventEmitter } from "events";
import { Qlobber, QlobSignals } from "./Qlobber";
export declare class MQTTPubSub extends EventEmitter {
    clients: object;
    seperator: QlobSignals;
    qlobber: Qlobber;
    constructor();
    serverHandler: (client: Socket, req: RequestOptions) => void;
    deleteClientClass: (client_id: string) => void;
}
