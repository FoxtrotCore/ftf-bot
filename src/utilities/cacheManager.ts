import {log} from "../main";
import {GCPClient} from "./googleCloudStorage";
import {BotNotConfigured} from "./error_specs/BotNotConfigured";
import {ManifestNotGenerated} from "./error_specs/ManifestNotGenerated";

const fs = require('fs-extra')

interface ConfigData {
    unconfigured?: boolean
    discord: {
        token: string
        client_id: string
    },
    gcp_key_path: string
}

export class CacheManager {
    // Static things
    public static CACHE_DIR_MODE = 0o2700

    // Instance things
    private gcp_client: GCPClient
    private base_dir: string
    private cache_dir: string
    private config_path: string
    private gcp_key_path: string
    private manifest_path: string
    private manifest: Object

    constructor(gcp_client: GCPClient = null, base_dir: string = __dirname) {
        // Dependency injection
        this.gcp_client = gcp_client

        // Dirs
        this.base_dir = base_dir
        this.cache_dir = `${this.base_dir}/cache`
        this.config_path = `${this.base_dir}/config.json`
        this.gcp_key_path = `${this.base_dir}/gcp-key.json`
        this.manifest_path = `${this.base_dir}/manifest.json`

        // Create the cache dir
        fs.ensureDir(this.cache_dir, {mode: CacheManager.CACHE_DIR_MODE})
            .then(() => {
                log.info(`Cache directory -> ${this.cache_dir}`)
            })
            .catch(log.error)
    }

    private defaultConfig() : ConfigData {
        return {
            unconfigured: true,
            discord: {
                token: '<Discord Token>',
                client_id: '<Discord Client ID>'
            },
            gcp_key_path: this.gcp_key_path
        }
    }

    public setGCPClient(gcp_client: GCPClient) : CacheManager {
        this.gcp_client = gcp_client
        return this
    }

    public async getGCPPing() : Promise<Number> {
        return await this.gcp_client.getPing()
    }

    public async generateManifest() {
        await this.gcp_client.generateManifest().then(async (manifest: Map<string, any>) => {
            this.manifest = manifest
            await fs.writeJson(this.manifest_path, this.manifest, {spaces: '\t'})
                .then(() => {
                    log.info(`Wrote manifest to -> ${this.manifest_path}`)
                })
                .catch(log.error)
        })
    }

    public async getConfig() : Promise<Object> {
        if(await fs.pathExists(this.config_path)) {
            const config = await fs.readJson(this.config_path)
            if(!config.unconfigured) {
                return config
            }
            log.warn(`Config exists but is marked as unconfigured! Please edit ${this.config_path} with the proper credentials before restarting the bot!`)
        } else {
            await fs.writeJson(this.config_path, this.defaultConfig(), {spaces: '\t'})
        }

        throw new BotNotConfigured()
    }

    public async episodeIsCached(episode_number: number) : Promise<boolean> {
        if(this.manifest === undefined) {
            throw new ManifestNotGenerated()
        }
        const file_name = this.manifest[episode_number.toString()]
        const file_path = `${this.cache_dir}/${file_name}`

        return await fs.pathExists(file_path)
    }

    public async getEpisodeVideoFile(episode_number: number) : Promise<string> {
        const file_name = this.manifest[episode_number.toString()]

        // Return just the path to the video if already cached
        if(await this.episodeIsCached(episode_number)) {
            const destination = `${this.cache_dir}/${file_name}`
            log.info(`Video file already cached at -> ${destination}`)
            return destination
        }

        // Do the download and return the path to the video after
        return await this.gcp_client.fetchRemoteVideoFile(file_name, this.cache_dir)
    }
}