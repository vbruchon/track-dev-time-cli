//@ts-nocheck
import fs from "fs";
import path from "path";

const SESSIONS_PATH = path.resolve("track-dev-time", "sessions.json");

const readDataFromFile = () => {
  return JSON.parse(fs.readFileSync(SESSIONS_PATH, "utf-8"));
};

const writeDataToFile = (data) => {
  fs.writeFileSync(SESSIONS_PATH, JSON.stringify(data, null, 2), "utf-8");
};

const ensureSessionStorage = () => {
  if (!fs.existsSync(path.dirname(SESSIONS_PATH))) {
    fs.mkdirSync(path.dirname(SESSIONS_PATH), { recursive: true });
  }

  if (!fs.existsSync(SESSIONS_PATH)) {
    const projectName = path.basename(process.cwd());
    const initialData = { projectName: projectName, sessions: [] };
    writeDataToFile(initialData);
  }
};

export const getCurrentSession = () => {
  const data = readDataFromFile();
  return data.sessions.find((session) => !session.end) || null;
};

export const saveSession = (currentSession, action) => {
  ensureSessionStorage();

  const data = readDataFromFile();

  switch (action) {
    case "START":
      saveStartSession(data.sessions, currentSession);
      break;
    case "PAUSE":
      savePauseSession(data.sessions, currentSession);
      break;
    case "END":
      saveEndSession(data.sessions, currentSession);
      break;
    default:
      console.log("Unknown action");
      break;
  }

  writeDataToFile(data);
  console.log("Session saved!");
};

const saveStartSession = (sessions, currentSession) => {
  closeLastOpenSessionIfNeeded(sessions);
  sessions.push(currentSession);
};

const closeLastOpenSessionIfNeeded = (sessions) => {
  const lastSession = sessions[sessions.length - 1];
  if (lastSession && !lastSession.end) {
    lastSession.end = new Date().toISOString();
    lastSession.duration =
      (new Date(lastSession.end) - new Date(lastSession.start)) / 1000;
  }
};

const saveEndSession = (sessions, currentSession) => {
  const today = new Date().toDateString();

  const index = sessions.findIndex(
    (session) =>
      !session.end && new Date(session.start).toDateString() === today
  );

  if (index !== -1) {
    const lastPause =
      sessions[index].pauses?.[sessions[index].pauses.length - 1];
    if (lastPause && lastPause.end === null) {
      lastPause.end = currentSession.end;
      console.log("Pause terminée avant la fermeture de la session");
    }

    sessions[index].end = currentSession.end;
    sessions[index].duration = currentSession.duration;

    console.log("Session fermée et sauvegardée");
  }
};

const savePauseSession = (sessions, updatedSession) => {
  const index = sessions.findIndex((s) => s.id === updatedSession.id);
  if (index !== -1) {
    sessions[index] = updatedSession;
  } else {
    sessions.push(updatedSession);
  }
};

export const getLastPause = () => {
  const currentSession = getCurrentSession();
  return currentSession?.pauses?.[currentSession.pauses.length - 1] || null;
};
