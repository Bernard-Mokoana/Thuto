import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ffprobeStatic from "ffprobe-static";

const execFileAsync = promisify(execFile);

const normalizeDuration = (value) => {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds < 0) return 0;
  return Math.round(seconds);
};

// Uses ffprobe-static for the binary path and spawns ffprobe with JSON output.

export const getVideoDurationInSeconds = async (videoSource) => {
  if (!videoSource || typeof videoSource !== "string") {
    return 0;
  }

  const ffprobePath = ffprobeStatic?.path;
  if (!ffprobePath) {
    throw new Error("ffprobe binary path not available");
  }

  const args = [
    "-v",
    "quiet",
    "-print_format",
    "json",
    "-show_format",
    "-i",
    videoSource,
  ];

  try {
    const { stdout } = await execFileAsync(ffprobePath, args, {
      encoding: "utf8",
      maxBuffer: 1024 * 1024,
    });
    const metadata = JSON.parse(stdout);
    return normalizeDuration(metadata?.format?.duration);
  } catch (error) {
    throw error;
  }
};
