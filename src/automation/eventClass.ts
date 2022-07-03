import { Client } from "discord.js";

export default abstract class EventClass {
    private readonly eventName : string;
    private readonly runOnce : boolean;

    protected constructor(eventName : string, runOnce : boolean) {
        this.eventName = eventName;
        this.runOnce = runOnce;
    }

    getEventName() : string {
        return this.eventName;
    }

    isRunOnce() : boolean {
        return this.runOnce;
    }

    abstract exec(bot : Client, ...args : unknown[]): void;
}
