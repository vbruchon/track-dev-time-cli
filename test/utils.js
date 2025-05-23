import fs from "fs";
import { nanoid } from "nanoid";
import path from "path";
import { getCurrentSession, saveSession } from "../lib/storage";
import { vi } from "vitest";

export const TEST_PATH = path.resolve("test_data", "sessions.json");
export let currentSession = {
  id: `session-${nanoid()}`,
  start: new Date().toISOString(),
  pauses: [],
  end: null,
  duration: null,
};

export const cleanupTestData = () => {
  if (fs.existsSync(TEST_PATH)) {
    fs.unlinkSync(TEST_PATH);
  }

  const dir = path.dirname(TEST_PATH);

  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
};

export const makeCurrentSession = () => ({
  id: `session-${nanoid()}`,
  start: new Date().toISOString(),
  pauses: [],
  end: null,
  duration: null,
});

export const createAndSaveSession = () => {
  const session = makeCurrentSession();
  saveSession(session, "START", TEST_PATH);
  return getCurrentSession(TEST_PATH);
};

export const createPause = (startOffsetMinutes = 15) => ({
  id: nanoid(5),
  start: new Date(Date.now() + startOffsetMinutes * 60 * 1000).toISOString(),
  end: null,
});

export const setupTestEnvironment = (
  TEST_DIR,
  TEST_PACKAGE_JSON,
  TEST_GITIGNORE
) => {
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }

  const packageJson = {
    name: "test-project",
    scripts: {
      dev: "next dev",
    },
  };
  fs.writeFileSync(
    TEST_PACKAGE_JSON,
    JSON.stringify(packageJson, null, 2),
    "utf-8"
  );

  fs.writeFileSync(TEST_GITIGNORE, "", "utf-8");
};

export const mockLog = () => {
  const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  return { logSpy, errorSpy };
};

export const restoreMockLog = (logSpy, errorSpy) => {
  logSpy?.mockRestore();
  errorSpy?.mockRestore();
};
