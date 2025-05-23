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

export const markInactivity = () => {
  if (!pauseStarted) {
    recordPause(true);
    pauseStarted = true;
  }
};

export const markActivity = () => {
  recordPause(false);
  clearTimeout(timer);
  timer = setTimeout(markInactivity, INACTIVITY_DELAY);
};

const recordPause = (isPaused) => {
  const now = new Date().toISOString();

  if (isPaused) {
    const pause = { id: nanoid(5), start: now, end: null };
    pauseTracking(pause);
  } else {
    resetPauseStarted();
    const lastPause = getLastPause();
    if (lastPause && lastPause.end === null) {
      lastPause.end = now;
      pauseTracking(lastPause);
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

  watcher.on("change", markActivity);
  watcher.on("add", markActivity);
  watcher.on("unlink", markActivity);
  watcher.on("error", (error) => {
    console.error("❌ Error watcher :", error);
  });

  return watcher;
};
