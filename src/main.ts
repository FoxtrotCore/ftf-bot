import {RawDiscordRESTClient} from './utilities/discord';
import {CommandExecutable} from "./commands/CommandExecutable";
import {Client, CommandInteraction, Intents, Interaction} from "discord.js";
import {CacheManager} from "./utilities/cacheManager";
import {GCPClient} from "./utilities/googleCloudStorage";
import {ArgumentParser} from 'argparse';

// Setup the global logger
const createLogger = require('logging')
export const log = createLogger.default('FTF-Bot')

// Wrapping this in an async main function to assert order of operation
async function main() : Promise<void> {
    // Create the argparser
    const parser = new ArgumentParser({
        description: 'A discord bot for FTF!',
        add_help: true
    })
    parser.add_argument('-rc', '--register-commands', {
        dest: 'register_commands',
        action: 'store_true'
    })
    parser.add_argument('-uc', '--unregister-commands', {
        dest: 'unregister_commands',
        action: 'store_true'
    })
    const args = parser.parse_args()

    // Create cache manager
    const cache = new CacheManager(null, __dirname)
    const config: any = await cache.getConfig()

    // Create GCP Client and immediately generate a manifest
    const gcp_client = new GCPClient(config.gcp_key_path, 'ftf-renders')
    await cache.setGCPClient(gcp_client)
               .generateManifest()

    // Create the Discord bot with all the proper intents
    const discord_client = new Client({intents: [
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MESSAGE_TYPING,
            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
            Intents.FLAGS.DIRECT_MESSAGES
        ]})

    // Load the local command executable dictionary
    const command_dict = RawDiscordRESTClient.loadLocalCommandExecutables(['Ping', 'GetFrame'], cache, discord_client)

    // Un/Register all commands with discord if directed to
    const restClient = new RawDiscordRESTClient(config.discord.token, config.discord.client_id, command_dict)
    if(args.unregister_commands) {
        await restClient.deleteAllRemoteCommands()
    }
    if(args.register_commands) {
        await restClient.postAllLocalCommands()
    }
    if(args.register_commands || args.unregister_commands) {
        return
    }

    // Begin the bot event loop
    await discord_client.login(config.discord.token)
        .then(() => {
            discord_client.on('ready', (client) => {
                log.info(`Bot is ready as user: ${client.user.tag}!`)
            })

            discord_client.on('interactionCreate', async (interaction: Interaction) => {
                if(interaction.isCommand()) {
                    const cmd = (<CommandInteraction> interaction)
                    const callable = <CommandExecutable> command_dict.get(cmd.commandName)

                    try {
                        log.info(`Executing callable for ${cmd.user.tag} -> ${callable}`)
                        await callable.execute(cmd, cache)
                    }
                    catch (error) {
                        log.error(`${error}\n${error.stackTrace}`)
                    }
                }
            })
        })
        .catch(log.error)
}

// Send it
main()
    .then(() => {})
    .catch(log.error)
