import {REST} from "@discordjs/rest";
import {APIApplicationCommand, Routes} from "discord-api-types/v10";
import {ApplicationCommandData} from "discord.js";

export class RawDiscordRESTClient {
    client: REST
    discord_client_id: string
    token: string

    constructor(token: string, discord_client_id: string, version: string = '10') {
        this.token = token
        this.discord_client_id = discord_client_id
        this.client = new REST({version: version}).setToken(token)
    }

    async getCommands() : Promise<Array<APIApplicationCommand>> {
        return <Array<APIApplicationCommand>> await this.client.get(Routes.applicationCommands(this.discord_client_id))
    }

    async postCommand(command: ApplicationCommandData) : Promise<APIApplicationCommand> {
        const endpoint = Routes.applicationCommands(this.discord_client_id)
        return <APIApplicationCommand> await this.client.post(endpoint, {body: command})
    }

    async deleteCommand(command: APIApplicationCommand) : Promise<void> {
        const endpoint = Routes.applicationCommand(this.discord_client_id, command.id)
        return <void> await this.client.delete(endpoint)
    }
}