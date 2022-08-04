"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Qlobber = void 0;
class Qlobber {
    constructor(qlob = "/") {
        this.subscribe_events = [];
        this.setSubscribeEvent = (data) => {
            if (!this.subscribe_events.includes(data)) {
                this.subscribe_events.push(data);
            }
        };
        this.removeSubscribeEvent = (data) => {
            const event_index = this.subscribe_events.indexOf(data);
            if (event_index !== -1) {
                this.subscribe_events.splice(event_index, 1);
            }
        };
        this.getSubscribeEvent = () => {
            return this.subscribe_events;
        };
        this.qlob = qlob;
    }
}
exports.Qlobber = Qlobber;
//# sourceMappingURL=Qlobber.js.map