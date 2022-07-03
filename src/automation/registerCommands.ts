import { log } from '../main'
// This file is meant to be run in a dev environment, to register/reset Slashcommands globally.
// There will also be a field to set them for a guild, for testing purposes.

module.exports.createGuildSlashCommands = (bot, guildid) => {
    log.info(`Creating commands: ${bot.slashies.map(s => s.name).join(", ")} for ${guildid}`)

    bot.guilds.fetch(guildid).then(g => {
        bot.slashies.forEach(s => {
            g.commands.create(s)
        })
    })
}
