module.exports.loadEvents = (bot) => {
    const { readdirSync } = require("fs");
    readdirSync(`${__dirname}/../events/`).forEach(f => {
        if(f.endsWith(".js")){
            const js = require(`../events/${f}`);
            if(js instanceof require("./eventClass")){
                if(js.isRunOnce()) {
                    bot.once(js.getEventName(), (...args) => js.exec(...args, bot));
                } else {
                    bot.on(js.getEventName(), (...args) => js.exec(...args, bot));
                }
            }
        }
    });
}
module.exports.createCommands = (bot) => {
    const slashies = [];
    const {readdirSync} = require("fs");
    const commands = new Map();
    readdirSync(`${__dirname}/../commands/`).forEach(f => {
        if(f.endsWith(".js")){
            const js = require(`../commands/${f}`);
            if(js instanceof require("./commandClass")){
                commands.set(js.getSlashObj()["name"], js);
                slashies.push(js.getSlashObj());
            }
        }
    });
    bot.commands = commands;
    bot.slashies = slashies;
    console.log("Commands loaded.");
    bot.guilds.fetch();
    //This is only for testing purposes, global commands should be used in final product.
    //require("../automation/registerCommands").createGuildSlashCommands(bot, "353162387341312000");
}