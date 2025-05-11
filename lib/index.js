import { nanoid } from "nanoid";
import { saveSession } from "./storage.js";

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
  //TODO
};
