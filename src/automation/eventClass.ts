import { NullLiteral } from 'typescript'

export abstract class EventClass {
    private readonly eventName: string
    private readonly runOnce: boolean

    constructor(eventName: string, runOnce: boolean) {
        this.eventName = eventName
        this.runOnce = runOnce
    }

    getEventName() : string { return this.eventName }

    isRunOnce() : boolean { return this.runOnce }

    abstract exec(interaction, bot) : void
}
