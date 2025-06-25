import { readFile, writeFile } from "node:fs/promises";
import prompts from "prompts";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { WHISPER_MODEL } from "./whisper-config.mjs"; // Import current model for initial selection

// Resolve the current directory for file operations
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define the path to the whisper-config.mjs file
const configFilePath = join(__dirname, "whisper-config.mjs");

// Define the list of available Whisper
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
    // Read the current content of the config file
    const currentConfigContent = await readFile(configFilePath, "utf8");
    const lines = currentConfigContent.split("\n");

    // Determine the initial selection for the prompt based on the current WHISPER_MODEL
    const initialIndex = modelChoices.findIndex(
      (choice) => choice.value === WHISPER_MODEL,
    );

    // Prompt the user to select a new model
    const response = await prompts({
      type: "select",
      name: "selectedModel",
      message: "Select a Whisper model:",
      choices: modelChoices,
      initial: initialIndex !== -1 ? initialIndex : 0, // Set initial selection, default to first if not found
    });

    const selectedModel = response.selectedModel;

    if (!selectedModel) {
      console.log("Model selection cancelled. No changes made.");
      return;
    }

    // Update line 29 (which is index 28 in a 0-indexed array) with the new model
    lines[28] = `export const WHISPER_MODEL = "${selectedModel}";`;

    // Write the updated content back to the config file
    const updatedConfigContent = lines.join("\n");
    await writeFile(configFilePath, updatedConfigContent, "utf8");

    const displayName =
      modelChoices.find((c) => c.value === selectedModel)?.title ??
      selectedModel;
    console.log(`Model successfully changed to ${displayName}.`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

changeWhisperModel();
