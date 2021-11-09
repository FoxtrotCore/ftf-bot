class CommandClass {
    private readonly commandName: string;
    private readonly slashObj: object;
    constructor(commandName, slashObj) {
        this.commandName = commandName;
        this.slashObj = slashObj ? slashObj : null;
    }
    getCommandName(){return this.commandName;}
    getSlashObj(){return this.slashObj;}
    exec(){return console.log(`${this.getCommandName()} executed.`);}
}
module.exports = CommandClass;