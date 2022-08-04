/// <reference types="node" />
import { Socket } from "net";
import { RequestOptions } from "http";
import { EventEmitter } from "events";
export declare class MQTTPubSub extends EventEmitter {
    clients: object;
    constructor();
    serverHandler: (client: Socket, req: RequestOptions) => void;
    deleteClientClass: (client_id: string) => void;
}
