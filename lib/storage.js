import fs from "fs";
import path from "path";

const SESSIONS_PATH = path.resolve("track-dev-time", "sessions.json");

const ensureSessionStorage = () => {
  if (!fs.existsSync(path.dirname(SESSIONS_PATH))) {
    fs.mkdirSync(path.dirname(SESSIONS_PATH), { recursive: true });
  }

  if (!fs.existsSync(SESSIONS_PATH)) {
    const projectName = path.basename(process.cwd());
    const initialData = { projectName: projectName, sessions: [] };

    fs.writeFileSync(
      SESSIONS_PATH,
      JSON.stringify(initialData, null, 2),
      "utf-8"
    );
  }
  return;
};
