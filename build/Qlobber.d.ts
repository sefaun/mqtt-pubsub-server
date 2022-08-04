declare type QlobSignals = "." | "/" | ":" | "*";
export declare class Qlobber {
    private qlob;
    private subscribe_events;
    constructor(qlob?: QlobSignals);
    setSubscribeEvent: (data: string) => void;
    removeSubscribeEvent: (data: string) => void;
    getSubscribeEvent: () => string[];
}
export {};
