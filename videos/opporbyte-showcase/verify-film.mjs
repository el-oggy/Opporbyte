import { spawn } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const file = path.resolve(process.argv[2]);
const ffmpeg = process.argv[3] || "ffmpeg";
const command = spawn(ffmpeg, ["-hide_banner", "-nostats", "-progress", "pipe:1", "-i", file, "-af", "loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json", "-f", "null", "-"], { windowsHide: true });
let log = "", progress = "";
command.stderr.on("data", data => { log += data; });
command.stdout.on("data", data => { progress += data; });
const code = await new Promise((resolve, reject) => { command.on("error", reject); command.on("close", resolve); });
if (code !== 0) throw new Error(log);
const video = log.match(/Video: h264[^\n]*?(\d{3,4})x(\d{3,4})[^\n]*?([\d.]+) fps/);
const audio = log.match(/Audio: aac[^\n]*?48000 Hz, stereo/);
const duration = log.match(/Duration: (\d+):(\d+):([\d.]+)/);
const frames = [...progress.matchAll(/frame=(\d+)/g)].at(-1);
const loudness = log.match(/\{\s*"input_i"[\s\S]*?\}/);
const data = await readFile(file);
const boxes = [];
for (let offset = 0; offset + 8 <= data.length;) {
  let size = data.readUInt32BE(offset); const type = data.toString("ascii", offset+4, offset+8);
  if (size === 1) size = Number(data.readBigUInt64BE(offset+8));
  if (size === 0) size = data.length-offset;
  if (size < 8) throw new Error("Invalid MP4 box");
  boxes.push({ type, offset, size }); offset += size;
}
const moov = boxes.find(box => box.type === "moov");
const mdat = boxes.find(box => box.type === "mdat");
const result = {
  file: path.basename(file), bytes: data.length, sha256: createHash("sha256").update(data).digest("hex"),
  width: Number(video?.[1]), height: Number(video?.[2]), fps: Number(video?.[3]),
  frames: Number(frames?.[1]), duration: duration ? Number(duration[1])*3600+Number(duration[2])*60+Number(duration[3]) : null,
  audio: audio ? "AAC, 48 kHz, stereo" : null,
  fullDecode: "passed", fastStart: Boolean(moov && mdat && moov.offset < mdat.offset),
  measuredAudio: loudness ? JSON.parse(loudness[0]) : null,
};
result.passed = result.fps === 30 && result.frames === 1050 && result.duration === 35 && !!audio && result.fastStart
  && [[1920,1080],[1080,1920]].some(([w,h]) => result.width === w && result.height === h)
  && Number(result.measuredAudio?.input_tp) < 0 && Number(result.measuredAudio?.input_i) > -25;
await writeFile(file + ".verification.json", JSON.stringify(result, null, 2));
if (!result.passed) throw new Error(JSON.stringify(result));
console.log(JSON.stringify(result));
