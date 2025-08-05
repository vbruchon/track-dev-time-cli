import path from "path";

export let SESSIONS_PATH = path.resolve(".track-dev-time", "sessions.json");
export const CONFIG_PATH = path.resolve(".track-dev-time", "config.json");
export const META_PATH = path.resolve(".track-dev-time", "meta.json");

export const DEFAULT_INACTIVITY_DELAY = 15 * 60 * 1000;
export const DEFAULT_RESUME_WINDOW_MS = 5 * 60 * 1000;
