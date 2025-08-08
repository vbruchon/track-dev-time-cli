import chalk from "chalk";
import { getApiKey } from "./auth.js";
import { readDataFromFile, writeDataToFile } from "../utils/file-storage.js";
import { sendSessionToAPI } from "../storage/sync-api.js";
import { SESSIONS_PATH } from "../utils/constants.js";

export const syncSession = async (filePath = SESSIONS_PATH) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    console.log(
      chalk.red("❌ No API key found. Please run 'track-dev-time auth' first.")
    );
    return;
  }

  const file = readDataFromFile(filePath);
  const unsyncedSessions = file.sessions.filter((s) => s.synced !== true);

  if (unsyncedSessions.length === 0) {
    console.log(chalk.green("✅ All your sessions are already synchronized."));
    return;
  }

  console.log(
    chalk.blue(`📡 Synchronizing ${unsyncedSessions.length} sessions...`)
  );

  let syncedCount = 0;

  for (const session of unsyncedSessions) {
    try {
      session.duration = normalizeDuration(session.duration);
      const success = await sendSessionToAPI(file, session);

      if (success) {
        session.synced = true;
        syncedCount++;
      } else {
        console.error(chalk.red(`❌ Session ${session.id} failed to sync.`));
      }
    } catch (error) {
      console.error(
        chalk.red(
          `❌ Failed to sync session from ${session.start}: ${error.message}`
        )
      );
    }
  }

  writeDataToFile(file, filePath);

  console.log(
    chalk.green(
      `✅ Successfully synchronized ${syncedCount}/${unsyncedSessions.length} sessions.`
    )
  );
};

export const normalizeDuration = (duration) => Math.round(duration);
