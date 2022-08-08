export class BotNotConfigured extends Error {
    constructor() {
        super(`Bot has not yet been configured! Please edit the default config before restarting the bot!`);
    }
}