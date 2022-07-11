import { Intents, Client } from 'discord.js'
import {Bucket, Storage, StorageOptions, File} from "@google-cloud/storage";
import {assertBucketExists, fetchVideoFile} from "./automation/googleCloudStorage"
import {createCacheDir, ensureEpisode, ensureManifest, episodeIsCached} from "./automation/cacheManager";
const createLogger = require('logging')
const {Token, GCPProjectID, GCPKeyFileName, GCPBucketName, CacheDir} = require('./config.json')
const loader = require('./automation/loader')

// Setup the global logger
export const log = createLogger.default('FTF-Bot')

// Wrapping this in an async main function to assert order of operation
async function main() : Promise<void> {
    // Set up the Cache Directory
    const cache_dir = CacheDir.replace('./', `${__dirname}/`).replace('~/', `${process.env.HOME}/`) // Expand potential user vars
    await createCacheDir(cache_dir) // Do the deed

    // Create the GCP Storage session and subsequent manifest
    const storageOptions: StorageOptions = {
        keyFilename: __dirname + '/' + GCPKeyFileName,
        projectId: GCPProjectID
    }
    const storage = new Storage(storageOptions)

    // Ensure the expected remote resources exist
    await assertBucketExists(storage, GCPBucketName)
    const renders_bucket: Bucket = storage.bucket(GCPBucketName)

    // Create a manifest of local resources
    const manifest = await ensureManifest(renders_bucket, cache_dir)

    // Find local resources
    const ep_num = 2
    const ep_file = await ensureEpisode(ep_num, renders_bucket, manifest, cache_dir)
    log.info(`EP #${ep_num} available at: ${ep_file}`)

    // Setup the Discord client
    // const bot = new Client({
    //     intents: [
    //         Intents.FLAGS.GUILDS,
    //         Intents.FLAGS.DIRECT_MESSAGES
    //     ]
    // })
    //
    // // DB Stuff should be defined here too.
    // bot.login(Token)
    //   .then(() => {
    //     log.info(`Bot logged in as '${bot.user.tag}'!`)
    //     log.info('Loading event listeners:')
    //     loader.loadEvents(bot)
    //   })
    //   .catch(console.log);
}

// Send it
main()
    .then(() => {})
    .catch(log.error)