///@ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TEST_SESSION_PATH } from "./utils.js";
import { syncSession } from "../lib/commands/sync-session.js";
import { normalizeDuration } from "../lib/commands/sync-session.js";
import {
  readDataFromFile,
  writeDataToFile,
} from "../lib/utils/file-storage.js";
import { afterEach } from "vitest";

vi.mock("../lib/commands/auth.js", () => {
  return {
    getApiKey: vi.fn(),
  };
});

import { getApiKey } from "../lib/commands/auth.js";

vi.mock("../lib/storage/sync-api.js", () => ({
  sendSessionToAPI: vi.fn(),
}));

import { sendSessionToAPI } from "../lib/storage/sync-api.js";
import { createFakeData } from "./utils.js";

describe("syncSession", () => {
  let consoleLogSpy;
  beforeEach(() => {
    vi.resetAllMocks();

    const data = createFakeData();

    writeDataToFile(data, TEST_SESSION_PATH);
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
  });

  it("should not sync sessions if no API key", async () => {
    getApiKey.mockReturnValue(null);

    await syncSession(TEST_SESSION_PATH);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "❌ No API key found. Please run 'track-dev-time auth' first."
    );

    const data = readDataFromFile(TEST_SESSION_PATH);

    expect(data.sessions.every((s) => s.synced === false)).toBe(true);
  });

  it("should sync sessions if API key is present", async () => {
    getApiKey.mockReturnValue("fake-api-key");

    sendSessionToAPI.mockResolvedValue(true);

    await syncSession(TEST_SESSION_PATH);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "📡 Synchronizing 3 sessions..."
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      "✅ Successfully synchronized 3/3 sessions."
    );

    const data = readDataFromFile(TEST_SESSION_PATH);

    expect(data.sessions.every((s) => s.synced === true)).toBe(true);
  });

  it("session already synced ", async () => {
    getApiKey.mockReturnValue("fake-api-key");

    sendSessionToAPI.mockResolvedValue(true);

    const datas = readDataFromFile(TEST_SESSION_PATH);

    const sessions = datas.sessions;
    for (const session of sessions) {
      session.synced = true;
    }
    writeDataToFile(datas, TEST_SESSION_PATH);

    await syncSession(TEST_SESSION_PATH);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "✅ All your sessions are already synchronized."
    );

    const data = readDataFromFile(TEST_SESSION_PATH);

    expect(data.sessions.every((s) => s.synced === true)).toBe(true);
  });

  it("should handle failed session sync and log error", async () => {
    getApiKey.mockReturnValue("fake-api-key");

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    sendSessionToAPI.mockResolvedValue(false);

    await syncSession(TEST_SESSION_PATH);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("❌ Session session-1 failed to sync.")
    );

    const data = readDataFromFile(TEST_SESSION_PATH);
    expect(data.sessions.some((s) => s.synced === true)).toBe(false);

    consoleErrorSpy.mockRestore();
  });

  it("should handle exceptions thrown by sendSessionToAPI and log error", async () => {
    getApiKey.mockReturnValue("fake-api-key");

    sendSessionToAPI.mockImplementation(() => {
      throw new Error("API call failed");
    });

    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await syncSession(TEST_SESSION_PATH);

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("❌ Failed to sync session from")
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("API call failed")
    );

    consoleErrorSpy.mockRestore();
  });

  it("should round duration to nearest integer", () => {
    expect(normalizeDuration(10)).toBe(10);
    expect(normalizeDuration(10.1)).toBe(10);
    expect(normalizeDuration(10.5)).toBe(11);
    expect(normalizeDuration(10.9)).toBe(11);
    expect(normalizeDuration(0)).toBe(0);
    expect(normalizeDuration(-5.3)).toBe(-5);
  });
});
