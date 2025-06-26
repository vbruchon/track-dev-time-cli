export const sendSessionToAPI = async (data, currentSession) => {
  const apiKey = process.env.TRACK_DEV_TIME_API_KEY;
  const API_URL = "http://localhost:3000/api/sessions";

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
