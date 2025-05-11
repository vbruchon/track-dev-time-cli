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

export const saveSession = (currentSession) => {
  ensureSessionStorage();

  const data = JSON.parse(fs.readFileSync(SESSIONS_PATH, "utf-8"));

  data.sessions.push(currentSession);

  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2), "utf-8");

  console.log("Session saved!");
};
