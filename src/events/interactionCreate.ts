import EventClass from '../automation/eventClass'
import { log } from '../main'

export class InteractionCreate extends EventClass {
    constructor() {
        super('interactionCreate', false);

    }

    exec(bot, interaction) : void {
        const int = interaction;

        if(int.command !== undefined){
            if(!bot.callables.has(int.commandName)) {
              log.error(`Command ${int.commandName} does not have a paired callable object to execute! Skipping...`)
              return
            }

            const objCallable = bot.callables.get(int.commandName)
            log.info(`Executing ${int.commandName} called by ${int.member.user.tag}!`)
            objCallable.exec(int)
        }
    }
}
