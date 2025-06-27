import { getTotalPauseDuration, formatDuration } from "../utils/time.js";
import { ensureSessionStorage } from "../utils/file-storage.js";
import { getAllSessions } from "../utils/sessions.js";
import chalk from "chalk";

export const listTracking = () => {
  ensureSessionStorage();

  const sessions = getAllSessions();

  if (!sessions || sessions.length === 0) {
    console.log("No sessions found. Please run your server to begin tracking.");
    return;
  }

  sessions.forEach((session, index) => {
    const date = new Date(session.start).toLocaleString("fr-FR");
    const countPause = session.pauses?.length ?? 0;
    const status = session.end ? "Completed" : "In progress";
    const pauseDuration = getTotalPauseDuration(session.pauses);
    const duration = session.duration;
    const colorStatus =
      status === "Completed"
        ? chalk.green(`[${status}]`)
        : chalk.yellow(`[${status}]`);

    const line =
      `${String(index + 1).padEnd(2)}. ` +
      `${colorStatus} `.padEnd(14) +
      `${date.padEnd(20)} | ` +
      `Pauses: ${String(countPause).padEnd(2)} | ` +
      `Pause Time: ${formatDuration(pauseDuration).padEnd(6)}` +
      (status === "Completed"
        ? ` | Duration: ${formatDuration(duration)}`
        : "");

    console.log(line);
  });
};
