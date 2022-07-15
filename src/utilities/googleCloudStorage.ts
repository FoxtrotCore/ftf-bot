import {Bucket, File, GetFilesOptions, Storage} from '@google-cloud/storage'
import {log} from "../main";
import {episodeToFilePair} from "./cacheManager";

// Constant things that need to be config options eventually
export async function getBucketNames(storage: Storage) : Promise<string[]>{
    const [buckets] = await storage.getBuckets()
    return buckets.map((bucket) => bucket.name)
}

export async function getBucketFileNames(bucket: Bucket) : Promise<string[]> {
    const options: GetFilesOptions = {
        autoPaginate: false,
        delimiter: '/'
    }
    const [files] = await bucket.getFiles(options)
    return files.map((file: File) => file.name)
}

export async function createManifest(bucket: Bucket) : Promise<Object> {
    const manifest: Object = {}
    const files = await getBucketFileNames(bucket)

    files.forEach((filename: string) => {
        const episode_number = String(Number(filename.slice(0, 3)))
        manifest[episode_number] = filename
    })
    return manifest
}

export function assertBucketExists(storage: Storage, bucketName: string) {
    getBucketNames(storage)
        .then((buckets: string[]) => {
            if(!buckets.includes(bucketName)) {
                throw new Error(`Bucket '${bucketName}' was expected but not found in available buckets: ${buckets}!`)
            }
        })
        .catch(log.error)
}

export async function fetchVideoFile(bucket: Bucket, episode_number: Number, manifest: Object, cacheDir: string) : Promise<string> {
    const [files] = await bucket.getFiles()
    const file_name = episodeToFilePair(manifest, episode_number)
    const local_file = `${cacheDir}/${file_name}`
    const remote_file : File = files.filter((file: File) => file.name === file_name)[0]

    const options = {
        destination: local_file
    }
    remote_file.download(options)
    return local_file
}