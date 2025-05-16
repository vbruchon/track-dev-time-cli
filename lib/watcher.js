//@ts-nocheck
import chokidar from "chokidar";
import { getLastPause } from "./storage.js";
import { nanoid } from "nanoid";
import { pauseTracking } from "./index.js";

const INACTIVITY_DELAY = 15 * 60 * 1000;
let timer = null;
export let watcher = null;
export let pauseStarted = false;

export const resetPauseStarted = () => {
  pauseStarted = false;
};

export const markInactivity = (filePath = SESSIONS_PATH) => {
  if (!pauseStarted) {
    recordPause(true, filePath);
    pauseStarted = true;
  }
};

export const markActivity = (filePath = SESSIONS_PATH) => {
  recordPause(false, filePath);
  clearTimeout(timer);
  timer = setTimeout(markInactivity, INACTIVITY_DELAY);
};

const recordPause = (isPaused, filePath = SESSIONS_PATH) => {
  const now = new Date().toISOString();

  if (isPaused) {
    const pause = { id: nanoid(5), start: now, end: null };
    pauseTracking(pause, filePath);
  } else {
    resetPauseStarted();
    const lastPause = getLastPause(filePath);
    if (lastPause && lastPause.end === null) {
      lastPause.end = now;
      pauseTracking(lastPause, filePath);
    }
  }
};

export const startFileWatcher = (dir) => {
  watcher = chokidar.watch(dir, {
    ignored: [/node_modules/, /\.git/, /sessions\.json/],
    persistent: true,
  });

  watcher.on("ready", () => {
    console.log("✅ Watcher ready !");
    timer = setTimeout(markInactivity, INACTIVITY_DELAY);
  });

  watcher.on("change", (path) => {
    markActivity(path);
  });

  watcher.on("add", (path) => {
    markActivity(path);
  });

  watcher.on("unlink", (path) => {
    markActivity(path);
  });

  watcher.on("error", (error) => {
    console.error("❌ Error watcher :", error);
  });

  return watcher;
};
