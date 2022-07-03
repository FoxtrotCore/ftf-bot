import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { readdirSync } from "node:fs";
import { ApplicationCommandData } from "discord.js";
import Command from "./automation/commandClass";
import { log } from './main';

const { Token, ApplicationId } = require('./config.json')
const commands: ApplicationCommandData[] = [];

readdirSync("./commands").forEach(f => {
    if(!f.endsWith(".js")) return;
    const js = require(`./commands/${f}`);
    if(!(js instanceof Command)) return;
    const slashObj = js.getSlash();
    if(slashObj) commands.push(slashObj);
});

const rest = new REST({ version: '9' }).setToken(Token as string);

rest.put(Routes.applicationCommands(ApplicationId as string), { body: commands })
    .then(() => {
        log.info("Successfully registered application commands.");
    }).catch(e => {
        log.error(e);
    });