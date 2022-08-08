import {log} from "../main";
import {readJson} from 'fs-extra'
import {Bucket, DownloadResponse, File, GetBucketsResponse, Storage} from '@google-cloud/storage'
import {request} from 'https'

export class GCPClient {
    private storage: Storage
    private bucket: Bucket

    constructor(key_path: string, bucket_name: string) {
        // Get the project id from the key file
        const key = readJson(key_path)

        // Create the storage session
        this.storage = new Storage({
            keyFilename: key_path,
            projectId: key.project_id
        })

        // Serialize the bucket connection
        this.assertBucketExists(bucket_name)
        this.bucket = this.storage.bucket(bucket_name)
    }

    public async getPing(zone: string = 'northeast1-northeast1') : Promise<Number> {
        const start = Date.now()
        await request({
            hostname: `${zone}-5tkroniexa-nn.a.run.app`,
            port: 443,
            path: '/api/ping',
            method: 'GET'
        })
        return Date.now() - start
    }

    private assertBucketExists(bucket_name: string) {
        this.storage.getBuckets()
            .then(async (response: GetBucketsResponse) => {
                const buckets = response[0]
                const bucket_names = buckets.map((b) => b.name)

                if(!bucket_names.includes(bucket_name)) {
                    throw new Error(`Bucket gs://${bucket_name} does not exist among available buckets: ${bucket_names.map((b) => `gs://${b}`)}`)
                }
            })
            .catch(log.error)
    }

    private async getFileNames() : Promise<string[]> {
        const [files] = await this.bucket.getFiles({
            autoPaginate: false,
            delimiter: '/'
        })
        return files.map((file: File) => file.name)
    }

    public async generateManifest() : Promise<Object> {
        const files = await this.getFileNames()
        const manifest: Object = {}
        files.forEach((filename: string) => {
            const episode_number = String(Number(filename.slice(0, 3)))
            manifest[episode_number] = filename
        })
        return manifest
    }

    public async fetchRemoteVideoFile(file_name: string, destination_dir: string) : Promise<string> {
        // Piece together the source and destination files
        const [files] = await this.bucket.getFiles()
        const destination = `${destination_dir}/${file_name}`

        // Check to see if the file exists
        const source_files : File[] = files.filter((file: File) => file.name === file_name)
        if(source_files.length != 1) {
            throw new Error(`File gs://${this.bucket.name}/${file_name} was not found!`)
        }

        // Do the download
        log.warn(`Required to do a fetch from gs://${this.bucket.name}/${file_name}`)
        await source_files[0].download({destination: destination})
            .then((response: DownloadResponse) => {
                log.warn(response)
                log.info(`Downloaded file: ${response}`)
            })
            .catch(log.error)
        return destination
    }
}