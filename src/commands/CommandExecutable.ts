import {ApplicationCommandData, Client, CommandInteraction} from "discord.js";
import {CacheManager} from "../utilities/cacheManager";

export abstract class CommandExecutable {
    command: ApplicationCommandData
    cache: CacheManager
    discord_client: Client

    protected  constructor(command: ApplicationCommandData, cache: CacheManager, discord_client: Client) {
        this.command = command
        this.cache = cache
        this.discord_client = discord_client
    }

    abstract execute(interaction: CommandInteraction, cache: CacheManager) : void

    static load_from_callable(callable: CallableFunction, cache: CacheManager, discord_client: Client) : CommandExecutable {
        return new (<any> Object.entries(callable)[0][1])(cache, discord_client)
    }
}