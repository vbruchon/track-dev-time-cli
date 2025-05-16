//@ts-nocheck
import { nanoid } from "nanoid";
import { getCurrentSession, saveSession } from "./storage.js";
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
    console.log("Clôture de la pause en cours.");
  } else {
    currentSession.pauses.push(pause);
    console.log("Nouvelle pause commencée.");
  }

  saveSession(currentSession, "PAUSE");
  console.log("Pause saved!");
};

const calculTotalDuration = (currentSession) => {
  const startDate = new Date(currentSession.start);
  const endDate = new Date(currentSession.end);

  let totalDuration = (endDate - startDate) / 1000;

  const totalPauseDuration =
    currentSession.pauses?.reduce((acc, pause) => {
      const pauseStart = new Date(pause.start);
      const pauseEnd = new Date(pause.end);
      return acc + (pauseEnd - pauseStart) / 1000;
    }, 0) || 0;

  const total = totalDuration - totalPauseDuration;
  return Math.round(total * 100) / 100;
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
