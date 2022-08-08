import {REST} from "@discordjs/rest";
import {APIApplicationCommand, Routes} from "discord-api-types/v10";
import {ApplicationCommandData, Client} from "discord.js";
import {CommandExecutable} from "../commands/CommandExecutable";
import {log} from "../main";
import {CacheManager} from "./cacheManager";

export class RawDiscordRESTClient {
    private client: REST
    private discord_client_id: string
    private token: string
    private command_executables: Map<string, any>

    constructor(token: string, discord_client_id: string, command_executables: Map<string, any> = new Map(), version: string = '10') {
        this.token = token
        this.discord_client_id = discord_client_id
        this.client = new REST({version: version}).setToken(token)
        this.command_executables = command_executables
    }

    static loadLocalCommandExecutables(command_names: Array<string>, cache: CacheManager, discord_client: Client, commands_dir: string = `${__dirname}/../commands`) : Map<string, any> {
        log.info(`Looking for command executables in -> ${commands_dir}`)
        const command_dict = new Map<string, any>()
        command_names.forEach((name: string) => {
            const callable = require(`${commands_dir}/${name}`)

            const executable: CommandExecutable = CommandExecutable.load_from_callable(callable, cache, discord_client)
            command_dict.set(executable.command.name, executable)
        })
        log.info(`Found ${command_dict.size} commands!`)
        return command_dict
    }

    async getCommands() : Promise<Array<APIApplicationCommand>> {
        return <Array<APIApplicationCommand>> await this.client.get(Routes.applicationCommands(this.discord_client_id))
    }

    async postAllLocalCommands() {
        this.command_executables.forEach(async (command: CommandExecutable, name: string) => {
                await this.postCommand(command.command)
                .then((command: APIApplicationCommand) => {
                    log.warn(`Registered /${command.name} as #${command.id}`)
                })
                .catch(log.error)
        })
    }

    async postCommand(command: ApplicationCommandData) : Promise<APIApplicationCommand> {
        const endpoint = Routes.applicationCommands(this.discord_client_id)
        return <APIApplicationCommand> await this.client.post(endpoint, {body: command})
    }

    async deleteAllRemoteCommands() {
        await this.getCommands()
            .then((commands: Array<APIApplicationCommand>) => {
                commands.forEach(async (command: APIApplicationCommand) => {
                    await this.deleteCommand(command)
                        .then(() => {
                            log.warn(`Unregistered command /${command.name} with ID #${command.id}`)
                        })
                        .catch(log.error)
                })
            })
            .catch(log.error)
    }

    async deleteCommand(command: APIApplicationCommand) : Promise<void> {
        const endpoint = Routes.applicationCommand(this.discord_client_id, command.id)
        return <void> await this.client.delete(endpoint)
    }
}