//@ts-nocheck
import chokidar from "chokidar";
import {
  DEFAULT_INACTIVITY_DELAY,
  INACTIVITY_DELAY,
} from "../utils/constants.js";
import { pauseTracking } from "../commands/tracking.js";
import { getCurrentSession, getLastPause } from "../utils/sessions.js";
import { getConfig } from "../utils/config.js";

let timer = null;
export let watcher = null;
export let pauseStarted = false;
const config = getConfig();

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
  timer = setTimeout(
    markInactivity,
    config.inactivityTimeoutMs ?? DEFAULT_INACTIVITY_DELAY
  );
};

const recordPause = (isPaused) => {
  const now = new Date().toISOString();
  const currentSession = getCurrentSession();
  const pausesCount = currentSession?.pauses?.length ?? 0;

  if (isPaused) {
    const pause = { id: `pause-${pausesCount + 1}`, start: now, end: null };
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
    timer = setTimeout(
      markInactivity,
      config.inactivityTimeoutMs ?? DEFAULT_INACTIVITY_DELAY
    );
  });

  watcher.on("change", markActivity);
  watcher.on("add", markActivity);
  watcher.on("unlink", markActivity);
  watcher.on("error", (error) => {
    console.error("❌ Error watcher :", error);
  });

  return watcher;
};
