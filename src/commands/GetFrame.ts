import {FunctionNotImplemented} from "../utilities/FunctionNotImplemented";
import {CommandInteraction} from "discord.js";
import {CommandExecutable} from "./CommandExecutable";

export class GetFrame extends CommandExecutable {
    constructor() {
        super({
            name: 'get_frame',
            description: 'Get a frame!'
        });
    }

    async execute(interaction: CommandInteraction): Promise<void> {
        throw new FunctionNotImplemented()
    }
}