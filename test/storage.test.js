//@ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import {
  ensureSessionStorage,
  getCurrentSession,
  saveSession,
} from "../lib/storage";
import {
  cleanupTestData,
  createAndSaveSession,
  createPause,
  makeCurrentSession,
  mockLog,
  restoreMockLog,
  TEST_PATH,
} from "./utils";

let logSpy, errorSpy;

describe("ensureSessionStorage", () => {
  beforeEach(() => {
    cleanupTestData();

    mockLog(logSpy, errorSpy);
  });

  afterEach(() => {
    restoreMockLog(logSpy, errorSpy);
  });

  it("creates the directory and sessions.json file with initial content", () => {
    ensureSessionStorage(TEST_PATH);

    expect(fs.existsSync(TEST_PATH)).toBe(true);

    const data = JSON.parse(fs.readFileSync(TEST_PATH, "utf-8"));
    expect(data.projectName).toBe(path.basename(process.cwd()));
    expect(Array.isArray(data.sessions)).toBe(true);
    expect(data.sessions.length).toBe(0);
  });
});

describe("getCurrentSession", () => {
  beforeEach(() => {
    cleanupTestData();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    restoreMockLog(logSpy, errorSpy);
  });

  it("should return null if no session is open", () => {
    ensureSessionStorage(TEST_PATH);
    const currentSession = getCurrentSession(TEST_PATH);
    expect(currentSession).toBeNull();
  });

  it("should return the open session if one exists (without using saveSession)", () => {
    ensureSessionStorage(TEST_PATH);

    const data = {
      projectName: "test-project",
      sessions: [
        {
          id: "session-1",
          start: new Date().toISOString(),
          pauses: [],
          end: null,
          duration: null,
        },
      ],
    };
    fs.writeFileSync(TEST_PATH, JSON.stringify(data, null, 2), "utf-8");

    const currentSession = getCurrentSession(TEST_PATH);
    expect(currentSession).not.toBeNull();
    expect(currentSession.id).toBe("session-1");
    expect(currentSession.end).toBeNull();
  });
});

describe("saveSession", () => {
  beforeEach(() => {
    cleanupTestData();
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    restoreMockLog(logSpy, errorSpy);
  });

  it("should add a new session on START action", () => {
    const currentSession = makeCurrentSession();
    saveSession(currentSession, "START", TEST_PATH);

    const data = JSON.parse(fs.readFileSync(TEST_PATH, "utf-8"));
    const session = data.sessions[0];

    expect(data.sessions.length).toBe(1);
    expect(session.id).toBe(currentSession.id);
    expect(session.start).toBe(currentSession.start);
    expect(Array.isArray(session.pauses)).toBe(true);
    expect(session.pauses.length).toBe(0);
    expect(session.end).toBe(null);
    expect(session.duration).toBe(null);
  });

  it("should pause an existing session on PAUSE action", () => {
    const lastSession = createAndSaveSession();
    const openPause = createPause();

    lastSession.pauses.push(openPause);

    saveSession(lastSession, "PAUSE", TEST_PATH);

    const data = JSON.parse(fs.readFileSync(TEST_PATH, "utf-8"));
    const updatedSession = data.sessions.find((s) => s.id === lastSession.id);

    expect(updatedSession).toBeDefined();
    expect(Array.isArray(updatedSession.pauses)).toBe(true);
    expect(updatedSession.pauses.length).toBeGreaterThan(0);

    const lastPause = updatedSession.pauses.at(-1);
    expect(lastPause.id).toBe(openPause.id);
    expect(lastPause.start).toBe(openPause.start);
    expect(lastPause.end).toBe(null);
  });

  it("should close the session on END action without pauses in session", () => {
    const lastSession = createAndSaveSession();
    const endDate = new Date(
      new Date(lastSession.start).getTime() + 60 * 60 * 1000
    );
    lastSession.end = endDate.toISOString();
    lastSession.duration = (endDate - new Date(lastSession.start)) / 1000;

    saveSession(lastSession, "END", TEST_PATH);

    const data = JSON.parse(fs.readFileSync(TEST_PATH, "utf-8"));
    const session = data.sessions[0];

    expect(session.end).toBe(endDate.toISOString());
    expect(session.duration).toBe(3600);
  });

  it("should close the session on END action with pauses active", () => {
    const lastSession = createAndSaveSession();
    lastSession.pauses.push({
      id: "pause1",
      start: new Date(
        new Date(lastSession.start).getTime() + 15 * 60 * 1000
      ).toISOString(),
      end: null,
    });

    saveSession(lastSession, "PAUSE", TEST_PATH);

    const endDate = new Date(
      new Date(lastSession.start).getTime() + 60 * 60 * 1000
    );
    lastSession.end = endDate.toISOString();
    lastSession.duration = (endDate - new Date(lastSession.start)) / 1000;

    saveSession(lastSession, "END", TEST_PATH);

    const data = JSON.parse(fs.readFileSync(TEST_PATH, "utf-8"));
    const session = data.sessions[0];

    expect(session.end).toBe(endDate.toISOString());
    expect(session.duration).toBe(3600);
    const pause = session.pauses.find((p) => p.id === "pause1");
    expect(pause).toBeDefined();
    expect(pause.end).not.toBeNull();
  });

  it("should handle unknown action gracefully", () => {
    const session = makeCurrentSession();
    saveSession(session, "INVALID", TEST_PATH);

    expect(logSpy).toHaveBeenCalledWith("Unknown action");
    expect(logSpy).toHaveBeenCalledWith("Session saved!");

    const data = JSON.parse(fs.readFileSync(TEST_PATH, "utf-8"));
    expect(Array.isArray(data.sessions)).toBe(true);
    expect(data.sessions.length).toBe(0);
  });
});
