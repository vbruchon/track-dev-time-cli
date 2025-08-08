import fs from "fs";
import path from "path";

const BASE_TEST_DIR = path.resolve("test_data", ".track-dev-time");
export const TEST_SESSION_PATH = path.resolve(BASE_TEST_DIR, "sessions.json");

export const deleteTestFolderIfExist = () => {
  if (fs.existsSync(BASE_TEST_DIR)) {
    fs.rmSync(BASE_TEST_DIR, { recursive: true, force: true });
  }
};

export const createAndWriteDataFile = () => {
  fs.mkdirSync(BASE_TEST_DIR, { recursive: true });

  fs.writeFileSync(
    TEST_SESSION_PATH,
    JSON.stringify({ projectName: "test-project", sessions: [] }, null, 2)
  );
};

export const createFakeData = () => {
  return {
    projectName: "test-project",
    sessions: [
      {
        id: "session-1",
        start: "2025-08-07T17:31:03.148Z",
        pauses: [
          {
            id: "pause-1",
            start: "2025-08-07T17:31:13.165Z",
            end: "2025-08-07T17:31:24.366Z",
          },
        ],
        end: "2025-08-07T17:31:32.743Z",
        duration: 18,
        synced: false,
      },
      {
        id: "session-2",
        start: "2025-08-08T09:15:00.000Z",
        pauses: [
          {
            id: "pause-1",
            start: "2025-08-08T09:20:00.000Z",
            end: "2025-08-08T09:25:00.000Z",
          },
        ],
        end: "2025-08-08T09:45:00.000Z",
        duration: 30,
        synced: false,
      },
      {
        id: "session-3",
        start: "2025-08-09T14:00:00.000Z",
        pauses: [
          {
            id: "pause-1",
            start: "2025-08-09T14:10:00.000Z",
            end: "2025-08-09T14:15:00.000Z",
          },
          {
            id: "pause-2",
            start: "2025-08-09T14:25:00.000Z",
            end: "2025-08-09T14:30:00.000Z",
          },
        ],
        end: "2025-08-09T15:00:00.000Z",
        duration: 40,
        synced: false,
      },
    ],
  };
};

export const writePackageJson = (path, scripts = { dev: "next dev" }) => {
  fs.writeFileSync(
    path,
    JSON.stringify({ name: "test", scripts }, null, 2),
    "utf-8"
  );
};

export const writeConfigJson = (path) => {
  const configData = {
    inactivityTimeoutMs: 1000,
    autoResumeSessionWindowMs: 300000,
  };

  fs.writeFileSync(path, JSON.stringify(configData, null, 2), "utf-8");
};
