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

let trackingStopped = false;

export const startTracking = async () => {
  ensureSessionStorage();

  trackingStopped = false;
  const existingSessions = getAllSessions();
  const nextSessionId = existingSessions.length + 1;

  const session = {
    id: `session-${nextSessionId}`,
    start: new Date().toISOString(),
    pauses: [],
    end: null,
    duration: null,
    synced: false,
  };
  saveSession(session, "START");
  startFileWatcher(process.cwd());

  registerExitHandlers();
  console.log("start session tracking");
};

export const stopTracking = async () => {
  const currentSession = getCurrentSession();
  if (!currentSession) return console.log("No session tracking!");

  currentSession.end = new Date().toISOString();

  currentSession.duration = calculTotalDuration(currentSession);

  await saveSession(currentSession, "END");
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

export const pauseTracking = (pause) => {
  const currentSession = getCurrentSession();
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

  saveSession(currentSession, "PAUSE");
  console.log("Pause saved!");
};
