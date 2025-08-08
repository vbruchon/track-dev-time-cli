import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import { readDataFromFile } from "../lib/utils/file-storage.js";
import { startTracking, stopTracking } from "../lib/commands/tracking.js";
import { TEST_SESSION_PATH } from "./utils.js";

describe("🧪 File Storage (sessions.json)", () => {
  it("should create sessions.json if it doesn't exist", async () => {
    await startTracking(TEST_SESSION_PATH);

    const exists = fs.existsSync(TEST_SESSION_PATH);
    expect(exists).toBe(true);

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data).toHaveProperty("projectName");
    expect(data.sessions).toBeInstanceOf(Array);
  });

  it("should append new session instead of overwriting existing ones", async () => {
    fs.rmSync(TEST_SESSION_PATH, { force: true });

    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-06T10:00:00Z"));

    await startTracking(TEST_SESSION_PATH);
    await stopTracking(TEST_SESSION_PATH);

    vi.advanceTimersByTime(6 * 60_000);

    await startTracking(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data.sessions.length).toBe(2);

    vi.useRealTimers();
  });

  it("should maintain correct file structure", async () => {
    fs.rmSync(TEST_SESSION_PATH, { force: true });

    await startTracking(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data).toMatchObject({
      projectName: expect.any(String),
      sessions: expect.any(Array),
    });
  });
});
