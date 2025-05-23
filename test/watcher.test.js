import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  markActivity,
  markInactivity,
  resetPauseStarted,
} from "../lib/watcher.js";
import {
  cleanupTestData,
  createAndSaveSession,
  mockLog,
  restoreMockLog,
  TEST_PATH,
} from "./utils.js";
import fs from "fs";
import { getCurrentSession } from "../lib/storage.js";
import * as storage from "../lib/storage.js";

let logSpy, errorSpy;

describe("markInactivity and markActivity", () => {
  beforeEach(() => {
    cleanupTestData();
    resetPauseStarted();
    storage.__setSessionPath(TEST_PATH);

    mockLog(logSpy, errorSpy);
  });

  afterEach(() => {
    restoreMockLog(logSpy, errorSpy);
  });

  it("adds a pause with a start date", () => {
    const session = createAndSaveSession();
    markInactivity();

    const updated = getCurrentSession();

    expect(updated).toBeDefined();
    expect(updated.pauses).toHaveLength(1);
    expect(typeof updated.pauses[0].start).toBe("string");

    const raw = fs.readFileSync(TEST_PATH, "utf-8");
    const data = JSON.parse(raw);
    expect(data.sessions[0].pauses).toHaveLength(1);
  });

  it("close current pause with a end date", () => {
    createAndSaveSession();

    markInactivity();
    markActivity();

    const updated = getCurrentSession();

    expect(updated).toBeDefined();
    expect(updated.pauses).toHaveLength(1);
    expect(typeof updated.pauses[0].end).toBe("string");
  });
});
