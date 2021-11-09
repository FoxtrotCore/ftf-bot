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