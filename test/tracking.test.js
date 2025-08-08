import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import { TEST_SESSION_PATH } from "./utils.js";
import {
  readDataFromFile,
  writeDataToFile,
} from "../lib/utils/file-storage.js";
import { startTracking, stopTracking } from "../lib/commands/tracking.js";

describe("🧪 Session Tracking", () => {
  it("should create a new session with correct structure on start", async () => {
    await startTracking(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data.sessions.length).toBe(1);
    expect(data.sessions[0]).toMatchObject({
      id: expect.stringContaining("session-"),
      pauses: [],
      end: null,
      synced: false,
    });

    fs.rmSync(TEST_SESSION_PATH);
  });

  it("should complete a session with 'end' and valid 'duration' when stopped", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-06T10:00:00Z"));

    await startTracking(TEST_SESSION_PATH);
    vi.advanceTimersByTime(1_000);
    await stopTracking(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    const session = data.sessions[0];
    expect(session.end).not.toBeNull();
    expect(session.duration).toBeGreaterThan(0);

    vi.useRealTimers();
    fs.rmSync(TEST_SESSION_PATH);
  });

  it("should automatically close previous open session before starting a new one", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-06T10:00:00Z"));

    await startTracking(TEST_SESSION_PATH);
    vi.advanceTimersByTime(500);
    await startTracking(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data.sessions.length).toBe(2);

    const [closed, open] = data.sessions;
    expect(closed.end).not.toBeNull();
    expect(closed.duration).toBeGreaterThan(0);
    expect(open.end).toBeNull();

    vi.useRealTimers();
    fs.rmSync(TEST_SESSION_PATH);
  });

  it("should resume last session if within resumeWindowMs", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-06T10:00:00Z"));

    await startTracking(TEST_SESSION_PATH);
    vi.advanceTimersByTime(60_000);
    await stopTracking(TEST_SESSION_PATH);

    vi.advanceTimersByTime(4 * 60_000);
    await startTracking(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data.sessions.length).toBe(1);
    expect(data.sessions[0].end).toBeNull();
    expect(data.sessions[0].duration).toBeNull();

    vi.useRealTimers();
    fs.rmSync(TEST_SESSION_PATH);
  });

  it("should correctly subtract paused time from session duration", async () => {
    vi.useFakeTimers();
    const baseTime = new Date("2025-08-06T10:00:00Z").getTime();
    vi.setSystemTime(baseTime);

    await startTracking(TEST_SESSION_PATH);

    const data1 = readDataFromFile(TEST_SESSION_PATH);
    const session = data1.sessions[0];
    session.pauses.push({
      start: new Date(baseTime + 2 * 60_000).toISOString(),
      end: null,
    });
    writeDataToFile(data1, TEST_SESSION_PATH);

    vi.setSystemTime(baseTime + 19 * 60_000);
    const data2 = readDataFromFile(TEST_SESSION_PATH);
    data2.sessions[0].pauses[0].end = new Date(
      baseTime + 17 * 60_000
    ).toISOString();
    writeDataToFile(data2, TEST_SESSION_PATH);

    await stopTracking(TEST_SESSION_PATH);

    const finalData = readDataFromFile(TEST_SESSION_PATH);
    const finalSession = finalData.sessions[0];
    const expectedDurationSec = 4 * 60;

    expect(finalSession.duration).toBeCloseTo(expectedDurationSec, 1);

    vi.useRealTimers();
    fs.rmSync(TEST_SESSION_PATH);
  });

  it("should automatically close open pause when session stops", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-08-06T10:00:00Z"));

    await startTracking(TEST_SESSION_PATH);

    vi.advanceTimersByTime(2 * 60_000);

    const data = readDataFromFile(TEST_SESSION_PATH);
    data.sessions[0].pauses.push({
      start: new Date(Date.now()).toISOString(),
      end: null,
    });
    writeDataToFile(data, TEST_SESSION_PATH);

    await stopTracking(TEST_SESSION_PATH);

    const finalData = readDataFromFile(TEST_SESSION_PATH);
    const pause = finalData.sessions[0].pauses[0];

    expect(pause.start).toBeDefined();
    expect(pause.end).not.toBeNull();

    vi.useRealTimers();
    fs.rmSync(TEST_SESSION_PATH);
  });
});
