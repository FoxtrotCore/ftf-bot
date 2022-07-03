import { EventClass } from '../automation/eventClass'
import { log } from '../main'
const loader = require('../automation/loader')

export class Ready extends EventClass {
    constructor() {
        super("ready",true);
    }

    exec(interaction, bot) : void {
        bot.user.setPresence({ activities: [{ name: 'in Sector Five' }], status: 'dnd' })
        log.info('The bot has changed its internal status to READY!');
        log.info('Registering commands:')
        loader.createCommands(bot);
        //Check if DB missing any guilds or bot removed from any, remove leftover data.
    }
}
