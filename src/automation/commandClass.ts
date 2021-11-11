class CommandClass {
    private readonly slashObj: object;
    constructor(slashObj) {
        this.slashObj = slashObj;
    }
    getSlashObj(){return this.slashObj;}
    exec(){return console.log(`${this.getSlashObj()["name"]} executed.`);}
}
module.exports = CommandClass;