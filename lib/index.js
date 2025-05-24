//@ts-nocheck
import { nanoid } from "nanoid";
import {
  ensureSessionStorage,
  getAllSessions,
  getCurrentSession,
  saveSession,
} from "./storage.js";
import { startFileWatcher, watcher } from "./watcher.js";
import {
  calculTotalDuration,
  formatDuration,
  getTotalPauseDuration,
} from "./utils.js";

let trackingStopped = false;

export const startTracking = () => {
  trackingStopped = false;
  const session = {
    id: `session-${nanoid()}`,
    start: new Date().toISOString(),
    pauses: [],
    end: null,
    duration: null,
  };
  saveSession(session, "START");
  startFileWatcher(process.cwd());

  registerExitHandlers();
  console.log("start session tracking");
};

export const stopTracking = () => {
  const currentSession = getCurrentSession();
  if (!currentSession) return console.log("No session tracking!");

  currentSession.end = new Date().toISOString();

  currentSession.duration = calculTotalDuration(currentSession);

  saveSession(currentSession, "END");
  if (watcher) {
    watcher.close();
  }
  console.log("stop session tracking");
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

export const listTracking = () => {
  ensureSessionStorage();

  const sessions = getAllSessions();

  if (!sessions || sessions.length === 0) {
    console.log("No sessions found. Please run your server to begin tracking.");
    return;
  }

  sessions.forEach((session, index) => {
    const date = new Date(session.start).toLocaleString("fr-FR");
    const countPause = session.pauses?.length ?? 0;
    const status = session.end ? "Completed" : "In progress";
    const pauseDuration = getTotalPauseDuration(session.pauses);
    const duration = session.duration;

    const line =
      `${String(index + 1).padEnd(2)}. ` +
      `[${status}]`.padEnd(14) +
      `${date.padEnd(20)} | ` +
      `Pauses: ${String(countPause).padEnd(2)} | ` +
      `Pause Time: ${formatDuration(pauseDuration).padEnd(6)}` +
      (status === "Completed"
        ? ` | Duration: ${formatDuration(duration)}`
        : "");

    console.log(line);
  });
};

const handleExit = () => {
  if (trackingStopped) return;
  stopTracking();
  trackingStopped = true;
  process.exit();
};

const registerExitHandlers = () => {
  process.on("SIGINT", handleExit);
  process.on("SIGTERM", handleExit);
  process.on("exit", () => {
    if (!trackingStopped) {
      stopTracking();
      trackingStopped = true;
    }
  });
};
