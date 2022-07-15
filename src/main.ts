import {RawDiscordRESTClient} from './utilities/discord'
import {APIApplicationCommand} from "discord-api-types/v10";
import {CommandExecutable} from "./commands/CommandExecutable";
import {Client, CommandInteraction, Intents, Interaction} from "discord.js";
const createLogger = require('logging')
const {discord} = require('./config.json')

// Setup the global logger
export const log = createLogger.default('FTF-Bot')

function loadLocalCommands(command_names: Array<string>) : Map<string, CommandExecutable> {
    const command_dict = new Map<string, CommandExecutable>()
    command_names.forEach((name: string) => {
        const callable = require(`./commands/${name}`)

        const executable: CommandExecutable = CommandExecutable.load_from_callable(callable)
        command_dict[executable.command.name] = executable
    })
    return command_dict
}

// Wrapping this in an async main function to assert order of operation
async function main() : Promise<void> {
    // Create a discord client
    const client = new Client({intents: [
                                            Intents.FLAGS.GUILD_MESSAGES,
                                            Intents.FLAGS.GUILD_MESSAGE_TYPING,
                                            Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                                            Intents.FLAGS.DIRECT_MESSAGES
        ]})

    // Create a rest client
    const restClient = new RawDiscordRESTClient(discord.token, discord.client_id)

    // Unregister all commands
    // TODO: Dev mode only, remove on release
    await restClient.getCommands()
        .then((commands: Array<APIApplicationCommand>) => {
            commands.forEach(async (command: APIApplicationCommand) => {
                await restClient.deleteCommand(command)
                    .then(() => {
                        log.info(`Unregistered /${command.name} (${command.id})`)
                    })
                    .catch(log.error)
            })
        })
        .catch(log.error)

    // Register all commands
    const commands = loadLocalCommands(['GetFrame', 'Ping'])
    commands.forEach(async (command: CommandExecutable, _) => {
        await restClient.postCommand(command.command)
            .then((command: APIApplicationCommand) => {
                log.info(`Registered /${command.name} (${command.id})`)
            })
            .catch(log.error)
    })

    await client.login(discord.token)
        .then(() => {
            client.on('ready', (client) => {
                log.info(`Bot is ready as user: ${client.user.tag}!`)
            })

            client.on('interactionCreate', async (interaction: Interaction) => {
                if(interaction.isCommand()) {
                    const cmd = (<CommandInteraction> interaction)
                    log.info(`Command /${cmd.commandName} called by ${cmd.user.tag}, looking for it in callable dictionary: ${JSON.stringify(commands)}`)
                    const callable = <CommandExecutable>commands[interaction.commandName]

                    try {
                        await callable.execute(cmd)
                    }
                    catch (error) {
                        await cmd.reply(`Whoops, I tried to run \`/${cmd.commandName}\` for you but encountered this error:\n\`\`\`\n${error}\`\`\``)
                    }
                }
            })
        })
}

// Send it
main()
    .then(() => {})
    .catch(log.error)