import {Client, CommandInteraction} from "discord.js";
import {CommandExecutable} from "./CommandExecutable";
import {CacheManager} from "../utilities/cacheManager";

export class Ping extends CommandExecutable {
    constructor(cache: CacheManager, discord_client: Client) {
        super({
            name: 'ping',
            description: 'Get ping'
        }, cache, discord_client);
    }

    async execute(interaction: CommandInteraction, cache: CacheManager): Promise<void> {
        const g_ping = await this.cache.getGCPPing()
        const d_ping = this.discord_client.ws.ping
        await interaction.reply(`Google Cloud Platform: **\`${g_ping} ms\`**\nDiscord API: **\`${d_ping} ms\`**`)
    }
}