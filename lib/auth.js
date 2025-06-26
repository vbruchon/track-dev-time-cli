import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_PATH = path.join(os.homedir(), ".track-dev-time", "config.json");

export const handleAuthCommand = ({ apikey }) => {
  if (!apikey) {
    console.error("❌ No API key provided. Use --apikey <key>");
    process.exit(1);
  }

  ensureConfigDir();
  fs.writeFileSync(
    CONFIG_PATH,
    JSON.stringify({ apiKey: apikey }, null, 2),
    "utf-8"
  );
  console.log("✅ API key saved successfully!");
};

const ensureConfigDir = () => {
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const getApiKey = () => {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  const content = fs.readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(content).apiKey || null;
};
