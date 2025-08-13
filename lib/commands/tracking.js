//@ts-nocheck
import { getAllSessions, getCurrentSession } from "../utils/sessions.js";
import { startFileWatcher, watcher } from "../storage/watcher.js";
import { saveSession } from "../storage/session-storage.js";
import {
  calculTotalDuration,
  formatDuration,
  getTotalPauseDuration,
} from "../utils/time.js";
import { resendLastUnsyncedSessionIfNeeded } from "../storage/sync-api.js";
import { ensureSessionStorage } from "../utils/file-storage.js";
import { SESSIONS_PATH } from "../utils/constants.js";

let trackingStopped = false;

export const startTracking = async (filePath = SESSIONS_PATH) => {
  ensureSessionStorage(filePath);

  trackingStopped = false;
  const existingSessions = getAllSessions(filePath);
  const nextSessionId = existingSessions.length + 1;

  const session = {
    id: `session-${nextSessionId}`,
    start: new Date().toISOString(),
    pauses: [],
    end: null,
    duration: null,
    synced: false,
  };

  await saveSession(session, "START", filePath);
  startFileWatcher(process.cwd());
  registerExitHandlers();
  console.log("start session tracking");
};

export const stopTracking = async (filePath = SESSIONS_PATH) => {
  const currentSession = getCurrentSession(filePath);

  if (!currentSession) return console.log("No session tracking!");

  currentSession.end = new Date().toISOString();

  await saveSession(currentSession, "END", filePath);

  if (watcher) {
    watcher.close();
  }
  console.log("stop session tracking");
};

const handleExit = async () => {
  if (trackingStopped) return;
  await stopTracking();
  trackingStopped = true;
  process.exit();
};

const registerExitHandlers = () => {
  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);

  process.on("exit", (code) => {
    if (!trackingStopped) {
      console.log(
        `⚠️ Process exited with code ${code} before tracking was properly stopped.`
      );
    }
  });
};

export const pauseTracking = async (pause, filePath = SESSIONS_PATH) => {
  const currentSession = getCurrentSession(filePath);
  if (!currentSession) return;

  if (!currentSession.pauses) {
    currentSession.pauses = [];
  }

  const lastPause = currentSession.pauses[currentSession.pauses.length - 1];

  if (pause.end && lastPause && lastPause.end === null) {
    lastPause.end = pause.end;
    console.log("Closing the current pause.");
  } else {
    currentSession.pauses.push(pause);
    console.log("New pause started.");
  }

  await saveSession(currentSession, "PAUSE", filePath);
  console.log("Pause saved!");
};
