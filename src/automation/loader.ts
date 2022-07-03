import { EventClass } from './eventClass'
import { CommandClass } from './commandClass'
import { log } from '../main'

module.exports.loadEvents = (bot) => {
  // Dynamically load classes
  const { readdirSync } = require('fs')
  readdirSync(`${__dirname}/../events/`).forEach(f => {
    if(f.endsWith('.js')){
      import(`../events/${f}`).then((js) => {
        const obj = new(<any>Object.entries(js)[0][1])

        if(obj instanceof EventClass) {
          if(obj.isRunOnce()) {
            bot.once(obj.getEventName(), (...args) => obj.exec(args, bot))
          } else {
            bot.on(obj.getEventName(), (...args) => obj.exec(args, bot))
          }

          log.info(`* ${obj.getEventName()}`)
        }
      })
    }
  })
}

module.exports.createCommands = (bot) => {
  // Set up the callables dictionary, to pair commands to callables for later
  bot.callables = new Map()

  // Dynamically load classes
  const {readdirSync} = require('fs')
  readdirSync(`${__dirname}/../commands/`).forEach(f => {
    if(f.endsWith('.js')) {
      import(`../commands/${f}`).then((js) => {
        const obj = new(<any>Object.entries(js)[0][1])

        if(obj instanceof CommandClass) {
          bot.application.commands.create(obj.toJSON())
          bot.callables.set(obj.getName(), obj)
          log.info(`* \'${obj.getName()}\'`)
        }
      })
    }
  })
}
