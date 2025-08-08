import { readDataFromFile } from "./file-storage.js";
import { SESSIONS_PATH } from "./constants.js";

export const getCurrentSession = (filePath = SESSIONS_PATH) => {
  const data = readDataFromFile(filePath);
  return data.sessions.find((session) => !session.end) || null;
};

export const getAllSessions = (filePath = SESSIONS_PATH) => {
  return readDataFromFile(filePath).sessions;
};

export const getLastPause = (filePath = SESSIONS_PATH) => {
  const currentSession = getCurrentSession(filePath);
  return currentSession?.pauses?.[currentSession.pauses.length - 1] || null;
};

// export const __setSessionPath = (customPath) => {
//   SESSIONS_PATH = customPath;
// };
