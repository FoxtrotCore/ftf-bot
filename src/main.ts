const { Intents, Client } = require("discord.js");
const { Token } = require("./config.json");
const Bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
});
//DB Stuff should be defined here too.
Bot.login(Token).then(()=>{
    console.log(`${Bot.user.username} logged in.`);
    require("./automation/loader").loadEvents(Bot);
}).catch(e => {
    console.log(e);
});