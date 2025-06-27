import { execSync } from "node:child_process";
import {
  existsSync,
  rmSync,
  writeFileSync,
  lstatSync,
  mkdirSync,
  readdirSync,
} from "node:fs";
import path from "path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";

const WHISPER_PATH = path.join(process.cwd(), "whisper.cpp");
const WHISPER_VERSION = "1.7.2";
const WHISPER_MODEL = "medium";
const WHISPER_LANG = "en";

const extractToTempAudioFile = (fileToTranscribe, tempOutFile) => {
  execSync(
    `bunx remotion ffmpeg -i "${fileToTranscribe}" -ar 16000 "${tempOutFile}" -y`,
    { stdio: ["ignore", "inherit"] },
  );
};

const subFile = async (filePath, fileName, folder) => {
  const outPath = path.join(
    process.cwd(),
    "public",
    folder,
    fileName.replace(".wav", ".json"),
  );

  const whisperCppOutput = await transcribe({
    inputPath: filePath,
    model: WHISPER_MODEL,
    tokenLevelTimestamps: true,
    whisperPath: WHISPER_PATH,
    whisperCppVersion: WHISPER_VERSION,
    printOutput: false,
    translateToEnglish: false,
    language: WHISPER_LANG,
    splitOnWord: true,
  });

  const { captions } = toCaptions({
    whisperCppOutput,
  });
  writeFileSync(
    outPath.replace("webcam", "subs"),
    JSON.stringify(captions, null, 2),
  );
};

const processMediaFile = async (fullPath, entry, directory) => {
  const supportedExtensions = [
    ".mp4",
    ".webm",
    ".mkv",
    ".mov",
    ".wav",
    ".mp3",
    ".aac",
    ".flac",
    ".ogg",
    ".m4a",
  ];
  const fileExtension = path.extname(fullPath).toLowerCase();

  if (!supportedExtensions.includes(fileExtension)) {
    return;
  }

  const fileNameWithoutExt = path.basename(fullPath, fileExtension);
  const jsonOutputPath = path
    .join(directory, fileNameWithoutExt + ".json")
    .replace("webcam", "subs");

  if (existsSync(jsonOutputPath)) {
    return;
  }

  let shouldRemoveTempDirectory = false;
  if (!existsSync(path.join(process.cwd(), "temp"))) {
    mkdirSync(`temp`);
    shouldRemoveTempDirectory = true;
  }
  console.log("Preparing audio for transcription from", entry);

  const tempWavFileName = fileNameWithoutExt + ".wav";
  const tempOutFilePath = path.join(process.cwd(), `temp/${tempWavFileName}`);

  extractToTempAudioFile(fullPath, tempOutFilePath);
  await subFile(
    tempOutFilePath,
    tempWavFileName,
    path.relative("public", directory),
  );
  if (shouldRemoveTempDirectory) {
    rmSync(path.join(process.cwd(), "temp"), { recursive: true });
  }
};

const processDirectory = async (directory) => {
  const entries = readdirSync(directory).filter((f) => f !== ".DS_Store");

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stat = lstatSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath); // Recurse into subdirectories
    } else {
      await processMediaFile(fullPath, entry, directory);
    }
  }
};

await installWhisperCpp({ to: WHISPER_PATH, version: WHISPER_VERSION });
await downloadWhisperModel({ folder: WHISPER_PATH, model: WHISPER_MODEL });

// Read arguments for filename if given else process all files in the directory
const hasArgs = process.argv.length > 2;

if (!hasArgs) {
  await processDirectory(path.join(process.cwd(), "public"));
  process.exit(0);
}

for (const arg of process.argv.slice(2)) {
  const fullPath = path.join(process.cwd(), arg);
  const stat = lstatSync(fullPath);

  if (stat.isDirectory()) {
    await processDirectory(fullPath);
    continue;
  }

  console.log(`Processing file ${fullPath}`);
  const directory = path.dirname(fullPath);
  const fileName = path.basename(fullPath);
  await processMediaFile(fullPath, fileName, directory);
}
