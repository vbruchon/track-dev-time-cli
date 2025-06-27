import { SESSIONS_PATH } from "./constants.js";
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
