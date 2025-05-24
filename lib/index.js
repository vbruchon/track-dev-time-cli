//@ts-nocheck
import { nanoid } from "nanoid";
import {
  ensureSessionStorage,
  getAllSessions,
  getCurrentSession,
  saveSession,
} from "./storage.js";
import { startFileWatcher, watcher } from "./watcher.js";

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

export const calculTotalDuration = (currentSession) => {
  const { start, end, pauses } = currentSession;

  const startDate = new Date(start);
  const endDate = new Date(end);

  const totalDuration = (endDate - startDate) / 1000;

  const totalPauseDuration = (pauses || []).reduce((acc, pause) => {
    if (!pause.start || !pause.end) {
      return acc;
    }
    const pauseStart = new Date(pause.start);
    const pauseEnd = new Date(pause.end);
    return acc + (pauseEnd - pauseStart) / 1000;
  }, 0);

  const net = totalDuration - totalPauseDuration;

  return Math.round(net * 100) / 100;
};

const getTotalPauseDuration = (pauses) => {
  if (!pauses || pauses.length === 0) return 0;
  return pauses.reduce((total, pause) => {
    if (pause.start && pause.end) {
      return total + pause.duration;
    }
    return total;
  }, 0);
};

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0m";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h > 0 ? h + "h " : ""}${m}m`;
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
