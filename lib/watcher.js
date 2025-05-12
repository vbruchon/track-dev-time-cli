//@ts-nocheck
import chokidar from "chokidar";
import { getLastPause } from "./storage.js";
import { nanoid } from "nanoid";
import { pauseTracking } from "./index.js";

const INACTIVITY_DELAY = 10 * 1000;
let timer = null;
let pauseStarted = false;

const markInactivity = () => {
  if (!pauseStarted) {
    console.log("activité interrompue");
    recordPause(true);
    pauseStarted = true;
  }
};

const markActivity = (path) => {
  recordPause(false);
  clearTimeout(timer);
  timer = setTimeout(markInactivity, INACTIVITY_DELAY);
};

const recordPause = (isPaused) => {
  const now = new Date().toISOString();

  if (isPaused) {
    const pause = { id: nanoid(5), start: now, end: null };
    console.log("Pause commencée : ", { pause });
    pauseTracking(pause);
  } else {
    pauseStarted = false;
    const lastPause = getLastPause();
    if (lastPause && lastPause.end === null) {
      lastPause.end = now;
      console.log("Pause terminée : ", { lastPause });
      pauseTracking(lastPause);
    }
  }
};

export const startFileWatcher = (dir) => {
  const watcher = chokidar.watch(dir, {
    ignored: [/node_modules/, /\.git/, /sessions\.json/],
    persistent: true,
  });

  watcher.on("ready", () => {
    console.log("✅ Watcher prêt !");
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
    console.error("❌ Erreur watcher :", error);
  });

  return watcher;
};
