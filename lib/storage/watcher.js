//@ts-nocheck
import chokidar from "chokidar";
import { DEFAULT_INACTIVITY_DELAY, SESSIONS_PATH } from "../utils/constants.js";
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

export const markInactivity = (filePath = SESSIONS_PATH) => {
  if (!pauseStarted) {
    recordPause(true, filePath);
    pauseStarted = true;
  }
};

export const markActivity = (filePath = SESSIONS_PATH) => {
  recordPause(false, filePath);
  clearTimeout(timer);
  timer = setTimeout(
    () => markInactivity(filePath),
    config.inactivityTimeoutMs ?? DEFAULT_INACTIVITY_DELAY
  );
};

export const recordPause = async (isPaused, filePath = SESSIONS_PATH) => {
  const now = new Date().toISOString();
  const currentSession = getCurrentSession(filePath);
  const pausesCount = currentSession?.pauses?.length ?? 0;

  if (isPaused) {
    const pause = { id: `pause-${pausesCount + 1}`, start: now, end: null };
    pauseTracking(pause, filePath);
  } else {
    resetPauseStarted();
    const lastPause = getLastPause(filePath);
    if (lastPause && lastPause.end === null) {
      lastPause.end = now;
      await pauseTracking(lastPause, filePath);
    }
  }
};

export const startFileWatcher = (dir) => {
  watcher = chokidar.watch(dir, {
    ignoreInitial: true,
    ignored: [
      /node_modules/,
      /\.git/,
      /\.track-dev-time/,
      /sessions\.json/,
      /test_data/,
      /test/,
    ],
    persistent: true,
  });

  watcher.on("ready", () => {
    console.log("✅ Watcher ready !");
    timer = setTimeout(
      () => markInactivity(SESSIONS_PATH),
      config.inactivityTimeoutMs ?? DEFAULT_INACTIVITY_DELAY
    );
  });

  watcher.on("all", (event, path) => {
    console.log(`[Watcher] Event: ${event}, Path: ${path}`);
    if (["change", "add", "unlink"].includes(event)) {
      markActivity(SESSIONS_PATH);
    }
  });

  watcher.on("error", (error) => {
    console.error("❌ Error watcher :", error);
  });

  return watcher;
};
