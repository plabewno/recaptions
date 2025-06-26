import { readFile, writeFile } from "node:fs/promises";
import prompts from "prompts";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const subMjsPath = join(__dirname, "sub.mjs");

const modelChoices = [
  { title: "tiny", value: "tiny" },
  { title: "base", value: "base" },
  { title: "small", value: "small" },
  { title: "medium", value: "medium" },
  { title: "large-v1", value: "large-v1" },
  { title: "large-v2", value: "large-v2" },
  { title: "large-v3", value: "large-v3" },
  { title: "large-v3-turbo", value: "large-v3-turbo" },
  { title: "large", value: "large" },
];

async function changeWhisperModel() {
  try {
    // Read the current content of the sub.mjs file
    const currentContent = await readFile(subMjsPath, "utf8");
    const lines = currentContent.split("\n");

    // Find the current model and the line index
    let currentModel = "";
    let modelLineIndex = -1;
    const modelRegex = /const WHISPER_MODEL = "(.*)";/;

    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(modelRegex);
      if (match) {
        currentModel = match[1];
        modelLineIndex = i;
        break;
      }
    }

    if (modelLineIndex === -1) {
      console.error("Could not find 'WHISPER_MODEL' in sub.mjs.");
      return;
    }

    // Determine the initial selection for the prompt
    const initialIndex = modelChoices.findIndex(
      (choice) => choice.value === currentModel,
    );

    // Prompt the user to select a new model
    const response = await prompts({
      type: "select",
      name: "selectedModel",
      message: "Select a Whisper model:",
      choices: modelChoices,
      initial: initialIndex !== -1 ? initialIndex : 0,
    });

    const { selectedModel } = response;

    if (!selectedModel) {
      console.log("Model selection cancelled. No changes made.");
      return;
    }

    // Update the line with the new model
    lines[modelLineIndex] = `const WHISPER_MODEL = "${selectedModel}";`;

    // Write the updated content back to the file
    const updatedContent = lines.join("\n");
    await writeFile(subMjsPath, updatedContent, "utf8");

    const displayName =
      modelChoices.find((c) => c.value === selectedModel)?.title ??
      selectedModel;
    console.log(`Model successfully changed to ${displayName}.`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

changeWhisperModel();