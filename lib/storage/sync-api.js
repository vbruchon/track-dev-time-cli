import { getApiKey } from "../commands/auth.js";
import { readDataFromFile, writeDataToFile } from "../utils/file-storage.js";

export const sendSessionToAPI = async (data, currentSession) => {
  const apiKey = getApiKey();
  const API_URL = "https://track-dev-time.dev/api/sessions";

  if (!apiKey) {
    console.warn("ℹ️ No API key found. Skipping API sync.");
    return false;
  }

  const closedSession = data.sessions.find(
    (s) => s.id === currentSession.id && s.end
  );

  if (!closedSession) return false;

  const payload = {
    ...closedSession,
    projectName: data.projectName,
  };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.json();
      console.error(
        "❌ API Error",
        res.status,
        JSON.stringify(errorBody, null, 2)
      );
      return false;
    }

    console.log("✅ Session sent to API");

    return true;
  } catch (error) {
    console.error("❌ Failed to send session to API:", error);
    return false;
  }
};

export const resendLastUnsyncedSessionIfNeeded = async (lastSession) => {
  const apiKey = getApiKey();
  if (!apiKey) return;

  console.log("🔁 Retrying sync of last session...");

  const file = readDataFromFile();
  const success = await sendSessionToAPI(file, lastSession);

  if (success) {
    const index = file.sessions.findIndex((s) => s.id === lastSession.id);
    if (index !== -1) {
      file.sessions[index].synced = true;
    }
    writeDataToFile(file);
    console.log("✅ Last session successfully synced.");
  } else {
    console.warn("⚠️ Retry failed. Will need manual sync.");
  }
};
