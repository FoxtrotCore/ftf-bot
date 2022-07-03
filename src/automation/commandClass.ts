import {
    ApplicationCommandData,
    Client,
    CommandInteraction
} from "discord.js";

export default abstract class CommandClass {
    private readonly name : string;
    private readonly slashObj? : ApplicationCommandData;

    protected constructor(commandName : string, slashObject? : ApplicationCommandData) {
        this.name = commandName;
        this.slashObj = slashObject;
    }

    getName() : string {
        return this.name;
    }

    getSlash() : ApplicationCommandData {
        return this.slashObj;
    }

    abstract exec(bot : Client, interaction : CommandInteraction) : void;
}
