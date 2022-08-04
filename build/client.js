"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Client = void 0;
const mqtt_packet_1 = __importDefault(require("mqtt-packet"));
const Qlobber_1 = require("./Qlobber");
const responses_1 = require("./protocol/responses");
const command_names_1 = require("./protocol/command_names");
class Client {
    constructor(that, client, client_id, req) {
        this.NewClient = () => {
            this.server_client.on('data', (data) => {
                if (!this.telemetry) {
                    this.telemetry = data;
                    this.telemetry_length = this.telemetry.length;
                }
                else {
                    this.telemetry = Buffer.concat([this.telemetry, data]);
                    this.telemetry_length = this.telemetry.length;
                }
                return this.DataFetcher();
            });
            this.server_client.on('error', (error) => {
                this.AllErrors({ error: true }, error);
            });
        };
        this.DataFetcher = () => {
            if (this.telemetry.length === 2 || this.telemetry.length === 4 || this.telemetry.length >= 5) {
                //First Byte Control
                if (!this.MQTTFirstByteControl(Number(this.telemetry[0]))) {
                    this.AllErrors({ protocol: true }, new Error('Invalid MQTT Packet !'));
                    return;
                }
                this.telemetry_length_value = this.MQTTPacketLengthControl(this.telemetry);
                if (this.telemetry_length > this.telemetry_length_value) {
                    this.data_counter++;
                    const packet = this.telemetry.slice(0, this.telemetry_length_value);
                    this.telemetry_backup = this.telemetry.slice(this.telemetry_length_value, this.telemetry_length);
                    this.telemetry = this.telemetry_backup;
                    this.telemetry_length = this.telemetry.length;
                    if (!this.client_auth && this.data_counter > 1) {
                        this.AllErrors({ protocol: true }, new Error('Client Authorization Error !'));
                        return;
                    }
                    else {
                        this.Operations(packet);
                        return this.DataFetcher();
                    }
                }
                else if (this.telemetry_length === this.telemetry_length_value) {
                    this.data_counter++;
                    if (!this.client_auth && this.data_counter > 1) {
                        this.AllErrors({ protocol: true }, new Error('Client Authorization Error !'));
                        return;
                    }
                    else {
                        this.Operations(this.telemetry);
                    }
                    this.telemetry = null;
                    this.telemetry_backup = null;
                    this.telemetry_length = 0;
                }
            }
        };
        this.MQTTPacketLengthControl = (data) => {
            let packet_length = Number(data[1]);
            if (data[1] > 127) {
                packet_length = Number((data[1] * 256) + data[2]);
                if (data[1] > 127 && data[2] > 127) {
                    packet_length = Number((data[1] * 256 * 256) + (data[2] * 256) + data[3]);
                    if (data[1] > 127 && data[2] > 127 && data[3] > 127) {
                        packet_length = Number((data[1] * 256 * 256 * 256) + (data[2] * 256 * 256) + (data[3] * 256) + data[4]);
                    }
                }
            }
            return packet_length + 2;
        };
        this.MQTTFirstByteControl = (mqtt_command) => {
            switch (Number(mqtt_command)) {
                case command_names_1.command_first_byte.connect:
                    return true;
                case command_names_1.command_first_byte.connack:
                    return true;
                case command_names_1.command_first_byte.publish:
                    return true;
                case command_names_1.command_first_byte.puback:
                    return true;
                case command_names_1.command_first_byte.pubrec:
                    return true;
                case command_names_1.command_first_byte.pubrel:
                    return true;
                case command_names_1.command_first_byte.pubcomp:
                    return true;
                case command_names_1.command_first_byte.subscribe:
                    return true;
                case command_names_1.command_first_byte.suback:
                    return true;
                case command_names_1.command_first_byte.unsubscribe:
                    return true;
                case command_names_1.command_first_byte.unsuback:
                    return true;
                case command_names_1.command_first_byte.pingreq:
                    return true;
                case command_names_1.command_first_byte.pingresp:
                    return true;
                case command_names_1.command_first_byte.disconnect:
                    return true;
                default:
                    return false;
            }
        };
        this.SendResponse = (data) => {
            this.server_client.write(data);
        };
        this.SendEventResponse = (data) => {
            this.server_client.write(data);
        };
        //MQTT Protocols
        this.ClientConnect = (packet) => {
            this.client_auth = true;
            this.SendResponse(Buffer.from(responses_1.responses.connack));
            this.keep_alive_time = packet.keepalive || 60;
            this.ClientKeepAliveController();
            this.NewClientLogger(packet);
        };
        this.ClientPublish = (packet) => {
            const publish_data = mqtt_packet_1.default.generate(packet);
            if (!this.ClientPublishTopicControl(packet.topic)) {
                this.broker.emit(packet.topic, publish_data);
                this.BrokerPublishLogger(publish_data);
            }
            else {
                this.AllErrors({ protocol: true }, new Error(`Invalid Topic: ${packet.topic}`));
            }
        };
        this.ClientSubscribe = (packet) => {
            this.sub_events.push(packet.subscriptions[0].topic);
            this.broker.addListener(packet.subscriptions[0].topic, this.SendEventResponse);
            this.SendResponse(Buffer.from(responses_1.responses.suback));
            this.BrokerSubscribeLogger(packet);
        };
        this.ClientPingreq = () => {
            this.SendResponse(Buffer.from(responses_1.responses.pingresp));
            this.ClientKeepAliveController();
        };
        this.ClientKeepAliveController = () => {
            clearTimeout(this.keep_alive);
            this.keep_alive = setTimeout(() => {
                this.AllErrors({ client: true }, new Error('Client Timeout'));
            }, (this.keep_alive_time * 1000) + 5000);
        };
        this.ClientPublishTopicControl = (data) => {
            if (data.indexOf("+") !== -1 || data.indexOf("#") !== -1) {
                return true;
            }
            return false;
        };
        this.Operations = (data) => {
            const packet_generator = mqtt_packet_1.default.parser({ protocolVersion: 4 });
            packet_generator.on("packet", (packet) => {
                switch (packet.cmd) {
                    //Connect Packet Control
                    case command_names_1.command_names.connect:
                        this.ClientConnect(packet);
                        break;
                    //Subscribe Packet Control
                    case command_names_1.command_names.subscribe:
                        this.ClientSubscribe(packet);
                        break;
                    //Publish Packet Control
                    case command_names_1.command_names.publish:
                        this.ClientPublish(packet);
                        break;
                    //Pingreq Packet Control
                    case command_names_1.command_names.pingreq:
                        this.ClientPingreq();
                        break;
                    //Disconnect Packet Control
                    case command_names_1.command_names.disconnect:
                        this.AllErrors({ disconnect: true });
                        break;
                    default:
                        this.AllErrors({ protocol: true }, new Error('Unknown Protocol'));
                        break;
                }
            });
            packet_generator.on("error", (error) => {
                this.AllErrors({ protocol: true }, error);
            });
            packet_generator.parse(data);
        };
        this.DeleteSubEventsFromEmitter = () => {
            this.sub_events.forEach((event) => {
                this.broker.removeListener(event, this.SendEventResponse);
            });
            this.sub_events = [];
        };
        this.AllErrors = (data, error) => {
            clearTimeout(this.keep_alive);
            this.server_client.destroy();
            this.DeleteSubEventsFromEmitter();
            this.broker.deleteClientClass(this.client_id);
            this.broker.emit("client-errors", this.server_client, data, error);
        };
        //Client Loggers
        this.NewClientLogger = (data) => {
            this.broker.emit("new-client", this.server_client, data);
        };
        //Broker Loggers
        this.BrokerPublishLogger = (data) => {
            this.broker.emit("client-publish", data);
        };
        this.BrokerSubscribeLogger = (data) => {
            this.broker.emit("client-subscribe", data);
        };
        this.broker = that;
        this.server_client = client;
        this.client_id = client_id;
        this.client_auth = false;
        this.sub_events = [];
        this.req = req;
        this.telemetry = null;
        this.telemetry_length = 0;
        this.telemetry_length_value = 0;
        this.telemetry_backup = null;
        this.data_counter = 0;
        this.qlobber = new Qlobber_1.Qlobber("/");
    }
}
exports.Client = Client;
//# sourceMappingURL=client.js.map