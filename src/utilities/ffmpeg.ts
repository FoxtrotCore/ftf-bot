import {log} from "../main"
const fs = require('fs-extra')
const shell = require('sheller.js')

const MS_BASE = 0.04 // 1,000 ms / 25 frames = 40 ms per frame or 0.040 fps

function round(num) {
    return Math.round(1 / (MS_BASE / num)) * MS_BASE
}

export function timestamp_to_frame_number(timestamp: String, framerate: number = 25) : number {
    const pieces = timestamp.split(':')
    const minute = Number(pieces[0])
    const second = round(Number(pieces[1]))

    return Math.round((((minute * 60) + second) * framerate))
}

async function ensure_output_dir(path: string) {
    await fs.ensureDir(path, 493)
            .then(log.info)
            .catch(log.error)
}

export async function getFrame(timestamp: string, video_path: string, output_path: string, frame_number: number) : Promise<any> {
    const tsp = timestamp.split(':')
    if(tsp.length == 2) {
        timestamp = `00:${timestamp}`
    } else if (tsp.length == 1) {
        timestamp = `00:00:${timestamp}`
    }

    await ensure_output_dir(output_path)

    const frame_rate = 25
    const frame_path = `${output_path}/${frame_number}.png`
    const cmd = `ffmpeg -n -accurate_seek -ss ${timestamp} -r ${frame_rate} -t 00:00:00.040 -i ${video_path} -frames:v 1 ${frame_path}`
    log.info(`Executing subshell: ${cmd}`)
    try {
        await shell(cmd)
    } catch(error) {
        log.error(error)
    }
    if(!await fs.pathExists(frame_path)){
        throw Error(`Expected frame to exist at: ${frame_path} but was not found!`)
    }
    return frame_path
}