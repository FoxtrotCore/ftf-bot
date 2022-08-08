import {Client, CommandInteraction, Interaction} from "discord.js";
import {CommandExecutable} from "./CommandExecutable";
import {ApplicationCommandOptionType} from "discord-api-types/v10";
import {log} from "../main";
import {CacheManager} from "../utilities/cacheManager";
import {getFrame, timestamp_to_frame_number} from "../utilities/ffmpeg";
import {AssertionError} from "assert";
import {Runtime} from "inspector";
const path = require('path')

export class GetFrame extends CommandExecutable {
    private static TIMESTAMP_FMT = '^([0-9]){1,2}:([0-9]){1,2}$'

    constructor(cache: CacheManager, discord_client: Client) {
        super({
            name: 'get_frame',
            description: 'Get a frame!',
            type: 1,
            options: [
                {
                    name: 'ep_number',
                    required: true,
                    description: 'The episode number to fetch a frame from (0-95)',
                    type: ApplicationCommandOptionType.Integer.valueOf()
                },
                {
                    name: 'timestamp',
                    required: true,
                    description: 'Timestamp of the frame to retrieve (formatted as `MM:SS`)',
                    type: ApplicationCommandOptionType.String.valueOf()
                },
                {
                    name: 'frame_number',
                    required: false,
                    description: '[Optional] The precise frame number within the second to retrieve (0-24)',
                    type: ApplicationCommandOptionType.Integer.valueOf()
                }
            ]
        }, cache, discord_client);
    }

    async assert_timestamp_format(timestamp: string, interaction: CommandInteraction) : Promise<string> {
        if(timestamp.match(GetFrame.TIMESTAMP_FMT) === null) {
            const msg = 'Incorrect timestamp format!\n\nMust be formatted as **`MM:SS`**'
            await interaction.reply(msg)
            throw new Error(msg)
        }
        return timestamp
    }

    async assert_frame_number(frame_number: number, timestamp: string, interaction: CommandInteraction) : Promise<number> {
        const global_frame_number = timestamp_to_frame_number(timestamp)
        const local_frame_number = (frame_number == null) ? 0 : frame_number
        if(local_frame_number < 0 || local_frame_number > 24) {
            const msg = 'Incorrect frame number!\n\nMust be between **`0`** and **`24`**'
            await interaction.reply(msg)
            throw new Error(msg)
        }

        return global_frame_number + local_frame_number
    }

    async execute(interaction: CommandInteraction, cache: CacheManager): Promise<void> {
        // Discord user inputs
        const ep_num = interaction.options.getInteger('ep_number')
        const timestamp = await this.assert_timestamp_format(interaction.options.getString('timestamp'), interaction)
        const frame_number = await this.assert_frame_number(interaction.options.getInteger('frame_number'), timestamp, interaction)

        // Assertions
        if(timestamp === null || frame_number === null) {
            log.warn(`User: ${interaction.user.tag} entered an incorrect argument for /${interaction.commandName}!\n\tIncluded options: ${interaction.options}\n\tExiting coroutine early!`)
            return
        }

        await interaction.reply(`Getting frame from ${ep_num}@${timestamp}-${frame_number}`)

        // Fetch the episode if the bot doesn't already have it
        if(!await this.cache.episodeIsCached(ep_num)){
            await interaction.editReply(`Looks like I don't hav episode # ${ep_num} on hand right now!\n\nPlease be patient while I go get it... :hourglass:`)
        }

        // Get the video from cache
        const video_path = await cache.getEpisodeVideoFile(ep_num)
        log.info(`Put remote video at -> ${video_path}`)
        await interaction.followUp(`Got the episode, extracting now!`)

        // Do the frame extraction
        const output_path = `${path.dirname(video_path)}/${ep_num}`
        const frame_path = await getFrame(timestamp, video_path, output_path, frame_number)

        // Deliver frame to user
        await interaction.followUp({
            content: `Here's the screenshot from episode #${ep_num} at ${timestamp} (frame #${frame_number})`,
            files: [frame_path]
        })
    }
}