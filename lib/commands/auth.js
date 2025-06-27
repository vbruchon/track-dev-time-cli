//@ts-nocheck
import fs from "fs";
import path from "path";
import os from "os";
import readline from "readline";

const CONFIG_PATH = path.join(os.homedir(), ".track-dev-time", "config.json");

export const handleAuthCommand = ({ apikey }) => {
  if (!apikey) {
    console.error("❌ No API key provided. Use --apikey <key>");
    process.exit(1);
  }

  ensureConfigDir();

  if (fs.existsSync(CONFIG_PATH)) {
    const existingConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    if (existingConfig.apiKey && existingConfig.apiKey !== apikey) {
      confirmOverwrite(() => {
        saveApiKey(apikey);
        console.log("✅ API key saved successfully!");
      });
      return;
    }
  }

  saveApiKey(apikey);
  console.log("✅ API key saved successfully!");
};

const confirmOverwrite = (onConfirm) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "⚠️ A different API key is already saved. Do you want to overwrite it? (y/n): ",
    (answer) => {
      rl.close();
      const normalized = answer.trim().toLowerCase();
      if (normalized === "y" || normalized === "yes") {
        onConfirm();
      } else {
        console.log("❌ Operation aborted, API key was not changed.");
        process.exit(0);
      }
    }
  );
};

const ensureConfigDir = () => {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const saveApiKey = (apikey) => {
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify({ apiKey: apikey }, null, 2),
    "utf-8"
  );
};

export const getApiKey = () => {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  const content = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(content).apiKey || null;
};
