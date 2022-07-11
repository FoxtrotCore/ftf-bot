import {log} from "../main";
import {Bucket} from "@google-cloud/storage";
import {createManifest, fetchVideoFile} from "./googleCloudStorage";
const fs = require('fs-extra')

export function episodeToFilePair(manifest: Object, episode_number: Number) : string {
    const fileName = manifest[String(episode_number)]
    if(fileName === undefined) throw Error(`No resource could be paired to the episode number #${episode_number}!`)
    return fileName
}

export function createCacheDir(cacheDir: string) {
    fs.ensureDir(cacheDir)
        .then(() => log.info(`Cache dir located at: ${cacheDir}`))
        .catch(log.error)
}

export async function writeManifestFile(bucket: Bucket, cacheDir: string) : Promise<Object> {
    const manifestPath = `${cacheDir}/manifest.json`
    const manifest = await createManifest(bucket)
    fs.writeJson(manifestPath, manifest)
    return manifest
}

export async function readManifestFile(cacheDir: string) : Promise<Object> {
    const manifestPath = `${cacheDir}/manifest.json`
    try {
        fs.pathExists(manifestPath)
        return await fs.readJson(manifestPath)
    } catch (error: any) {
        throw new Error(`Manifest does not exist at location: ${manifestPath}`)
    }
}

export async function ensureManifest(bucket: Bucket, cacheDir: string): Promise<Object> {
    try {
        return await readManifestFile(cacheDir)
    } catch (error: any) {
        log.warn(`Manifest at location was not found: ${cacheDir}/manifest.json! Generating now...`)
        return await writeManifestFile(bucket, cacheDir)
    }
}

export async function episodeIsCached(episode_number: Number, manifest: Object, cacheDir: string) : Promise<boolean> {
    return await fs.pathExists(`${cacheDir}/${episodeToFilePair(manifest, episode_number)}`)
}

export async function ensureEpisode(episode_number: Number, bucket: Bucket, manifest: Object, cacheDir: string) : Promise<string> {
    if(await episodeIsCached(episode_number, manifest, cacheDir)) {
        log.warn(`Skipping downloading EP #${episode_number}, already cached!`)
        return `${cacheDir}/${episodeToFilePair(manifest, episode_number)}`
    }
    return await fetchVideoFile(bucket, episode_number, manifest, cacheDir)
}