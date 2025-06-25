import path from "node:path";

export const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");
export const WHISPER_VERSION = "1.6.0";

/**
 * @type {import('@remotion/install-whisper-cpp').WhisperModel}
 */
export const WHISPER_MODEL = "medium";
/**
 * @type {import('@remotion/install-whisper-cpp').Language}
 */
export const WHISPER_LANG = "en";