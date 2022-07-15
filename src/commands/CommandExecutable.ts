import {ApplicationCommandData, CommandInteraction} from "discord.js";

export abstract class CommandExecutable {
    command: ApplicationCommandData

    constructor(command: ApplicationCommandData) {
        this.command = command
    }

    abstract execute(interaction: CommandInteraction) : void

    static load_from_callable(callable: CallableFunction) : CommandExecutable {
        return new(<any> Object.entries(callable)[0][1])
    }
}