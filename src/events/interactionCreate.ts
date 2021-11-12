class InteractionCreate extends require("../automation/eventClass"){
    constructor() {
        super("interactionCreate",false);
    }
    exec(ic,bot){
        if(ic.isCommand()){
            const cmd = bot.commands.get(ic.commandName);
            if(cmd){
                cmd.exec(ic,bot);
            }
        }
    }
}
module.exports = new InteractionCreate();