class Ping extends require("../automation/commandClass"){
    constructor() {
        super({
            name: "ping",
            description: "Get the ping."
        });
    }
    exec(ic){
        const start = new Date();
        ic.reply("Getting the latency...").then(()=>{
            const end = new Date();
            ic.editReply(`Ping is: \`${end.getTime() - start.getTime()}\`ms.`)
        });
    }
}
module.exports = new Ping();