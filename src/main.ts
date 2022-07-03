import { Intents, Client } from 'discord.js'
const createLogger = require('logging')
const { Token } = require('./config.json')
const loader = require('./automation/loader')

// Setup the logger
export const log = createLogger.default('FTF-Bot')

// Setup the client
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
})

// DB Stuff should be defined here too.
bot.login(Token)
  .then(() => {
    log.info(`Bot logged in as '${bot.user.tag}'!`)
    log.info('Loading event listeners:')
    loader.loadEvents(bot)
  })
  .catch(console.log);
