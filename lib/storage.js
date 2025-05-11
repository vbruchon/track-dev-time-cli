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

export const getCurrentSession = () => {
  const data = JSON.parse(fs.readFileSync(SESSIONS_PATH, "utf-8"));
  const currentSession = data.sessions.find((session) => !session.end);

  if (!currentSession) return null;

  return currentSession;
};

export const saveSession = (currentSession) => {
  ensureSessionStorage();

  const data = JSON.parse(fs.readFileSync(SESSIONS_PATH, "utf-8"));

  if (!currentSession.end) {
    checkIfLastSessionClosed(data);
    data.sessions.push(currentSession);
  } else {
    updateSession(data.sessions, currentSession);
  }

  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2), "utf-8");

  console.log("Session saved!");
};

const checkIfLastSessionClosed = (data) => {
  const lastSession = data.sessions[data.sessions.length - 1];

  if (!lastSession || lastSession.end) return;

  if (!lastSession.end) {
    lastSession.end = new Date().toISOString();
    lastSession.duration =
      (new Date(lastSession.end) - new Date(lastSession.start)) / 1000;
  }
};

const updateSession = (sessions, currentSession) => {
  const today = new Date().toDateString();

  const index = sessions.findIndex(
    (session) =>
      !session.end && new Date(session.start).toDateString() === today
  );

  if (index !== -1) {
    sessions[index].end = currentSession.end;
    sessions[index].duration = currentSession.duration;
  }
};
