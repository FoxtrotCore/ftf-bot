class EventClass {
    private readonly eventName: string;
    private readonly runOnce: boolean;
    constructor(event,once) {
        this.eventName = event;
        this.runOnce = once;
    }
    getEventName(){return this.eventName;}
    isRunOnce(){return this.runOnce;}
    exec(){return console.log(`${this.getEventName()} executed.`);}
}
module.exports = EventClass;