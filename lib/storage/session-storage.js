//@ts-nocheck
import fs from "fs";
import path from "path";
import { sendSessionToAPI } from "../storage/sync-api.js";
import {
  ensureSessionStorage,
  readDataFromFile,
  writeDataToFile,
} from "../utils/file-storage.js";
import { SESSIONS_PATH } from "../utils/constants.js";

export const saveSession = async (
  currentSession,
  action,
  filePath = SESSIONS_PATH
) => {
  ensureSessionStorage(filePath);

  const data = readDataFromFile(filePath);

  switch (action) {
    case "START":
      saveStartSession(data.sessions, currentSession);
      break;
    case "PAUSE":
      savePauseSession(data.sessions, currentSession);
      break;
    case "END":
      saveEndSession(data.sessions, currentSession);
      await sendSessionToAPI(data, currentSession);
      break;
    default:
      console.log("Unknown action");
      break;
  }

  writeDataToFile(data, filePath);
  console.log("Session saved!");
};

const saveStartSession = (sessions, currentSession) => {
  const lastSession = sessions[sessions.length - 1];
  const now = new Date();
  const fiveMinutes = 5 * 60 * 1000;

  if (
    lastSession &&
    lastSession.end &&
    now - new Date(lastSession.end) <= fiveMinutes
  ) {
    lastSession.end = null;
    lastSession.duration = null;

    console.log("Resuming last session instead");
  } else {
    closeLastOpenSessionIfNeeded(sessions);
    sessions.push(currentSession);
  }
};

const closeLastOpenSessionIfNeeded = (sessions) => {
  const lastSession = sessions[sessions.length - 1];
  if (lastSession && !lastSession.end) {
    lastSession.end = new Date().toISOString();
    lastSession.duration =
      (new Date(lastSession.end) - new Date(lastSession.start)) / 1000;
  }
};

const saveEndSession = (sessions, currentSession) => {
  const today = new Date().toDateString();

  const index = sessions.findIndex(
    (session) =>
      !session.end && new Date(session.start).toDateString() === today
  );

  if (index !== -1) {
    const lastPause =
      sessions[index].pauses?.[sessions[index].pauses.length - 1];
    if (lastPause && lastPause.end === null) {
      lastPause.end = currentSession.end;
      console.log("Pause ended before session closed");
    }

    sessions[index].end = currentSession.end;
    sessions[index].duration = currentSession.duration;

    console.log("\n");
    console.log("Session closed");
  }
};

const savePauseSession = (sessions, updatedSession) => {
  const index = sessions.findIndex((s) => s.id === updatedSession.id);
  if (index !== -1) {
    sessions[index] = updatedSession;
  } else {
    sessions.push(updatedSession);
  }
};
