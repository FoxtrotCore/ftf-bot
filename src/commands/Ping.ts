import {FunctionNotImplemented} from "../utilities/FunctionNotImplemented";
import {CommandInteraction} from "discord.js";
import {CommandExecutable} from "./CommandExecutable";

export class Ping extends CommandExecutable {
    constructor() {
        super({
            name: 'ping',
            description: 'Get ping'
        });
    }
    async execute(interaction: CommandInteraction): Promise<void> {
        throw new FunctionNotImplemented()
    }
}