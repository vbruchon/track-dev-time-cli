import { nanoid } from "nanoid";
import { getCurrentSession, saveSession } from "./storage.js";

let session = null;

export const startTracking = () => {
  session = {
    id: `session-${nanoid()}`,
    start: new Date().toISOString(),
    end: null,
    duration: null,
  };

  saveSession(session);

  console.log("start session tracking");
};

export const stopTracking = () => {
  const currentSession = getCurrentSession();
  if (!currentSession) return console.log("No session tracking!");

  currentSession.end = new Date().toISOString();

  const startDate = new Date(currentSession.start);
  const endDate = new Date(currentSession.end);

  currentSession.duration = (endDate - startDate) / 1000; // Durée en secondes
  saveSession(currentSession);
  console.log("stop session tracking");
  session = null;
};
