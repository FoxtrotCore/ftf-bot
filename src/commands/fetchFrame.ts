import { CommandClass } from '../automation/commandClass'
import { log } from '../main'

export class Ping extends CommandClass {
    constructor() {
        super()

        this.name = 'fetchFrame'
        this.description = 'fetch a frame from an episode of Code Lyoko'
    }

    exec(interaction) {
    }
}
