class Ready extends require("../automation/eventClass"){
    constructor() {
        super("ready",true);
    }
    exec(bot){
        console.log(`Ready event called.`);
        require("../automation/loader").createCommands(bot);
        //Check if DB missing any guilds or bot removed from any, remove leftover data.
        bot.user.setPresence({activities: [{name: `SCIPIO`}], status: "online"});
    }
}
module.exports = new Ready();
