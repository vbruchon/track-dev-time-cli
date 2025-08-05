import {
  CONFIG_PATH,
  DEFAULT_INACTIVITY_DELAY,
  DEFAULT_RESUME_WINDOW_MS,
  SESSIONS_PATH,
} from "./constants.js";
import fs from "fs";
import path from "path";

export const readDataFromFile = (filePath = SESSIONS_PATH) => {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

export const writeDataToFile = (data, filePath = SESSIONS_PATH) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

export const ensureSessionStorage = (filePath = SESSIONS_PATH) => {
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const projectName = path.basename(process.cwd());
    const initialData = { projectName, sessions: [] };
    writeDataToFile(initialData, filePath);
  }
};

const defaultConfig = {
  inactivityTimeoutMs: DEFAULT_INACTIVITY_DELAY,
  autoResumeSessionWindowMs: DEFAULT_RESUME_WINDOW_MS,
};

export const ensureConfigFile = () => {
  const configDir = path.dirname(CONFIG_PATH);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(
      CONFIG_PATH,
      JSON.stringify(defaultConfig, null, 2),
      "utf-8"
    );
    console.log("✅ config.json created with default settings");
  } else {
    console.log("ℹ️ config.json already exists");
  }
};
