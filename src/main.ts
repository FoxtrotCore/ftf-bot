import { Intents, Client } from 'discord.js'
import {Bucket, Storage, StorageOptions, File} from "@google-cloud/storage";
import {assertBucketExists, fetchVideoFile} from "./automation/googleCloudStorage"
import {
    createCacheDir, createDir,
    ensureEpisode,
    ensureManifest,
    episodeIsCached,
    episodeToFilePair
} from "./automation/cacheManager";
import {getFrame} from "./automation/ffmpeg";
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
    // const ep_num = 2
    //
    // const video_path = `${cache_dir}/${episodeToFilePair(manifest, ep_num)}`
    // const output_path = `${cache_dir}/${ep_num}`
    // createDir(output_path)
    // const image_path = await getFrame('40.15', video_path, output_path)
    // log.info(`Wrote frame to: ${image_path}`)

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