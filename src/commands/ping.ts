import CommandClass from '../automation/commandClass'
import { log } from '../main'

export class Ping extends CommandClass {
    constructor() {
        super(
            "ping",
            {
                name: "ping",
                description: "Ping the bot and get delay time (in ms) between the bot and Discord's servers"
            }
        );
    }

    exec(interaction) {
        const start = new Date();

        interaction.reply('Getting the latency...').then(() => {
            const end = new Date();
            interaction.editReply(`Ping is: \`${end.getTime() - start.getTime()}\`ms.`)
        })
    }
}
