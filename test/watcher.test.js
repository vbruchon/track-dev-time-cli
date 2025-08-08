import { describe, it, expect } from "vitest";
import { TEST_SESSION_PATH } from "./utils.js";
import { readDataFromFile } from "../lib/utils/file-storage";
import { beforeEach } from "vitest";
import { vi } from "vitest";
let startTracking, stopTracking, markInactivity, markActivity, watcherModule;

beforeEach(async () => {
  vi.resetModules();
  ({ startTracking, stopTracking } = await import(
    "../lib/commands/tracking.js"
  ));
  ({ markInactivity, markActivity } = await import(
    "../lib/storage/watcher.js"
  ));
  watcherModule = await import("../lib/storage/watcher.js");
});

describe("markInactivity and markActivity", () => {
  it("adds a pause with a start date", async () => {
    await startTracking(TEST_SESSION_PATH);

    markInactivity(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    const session = data.sessions[0];

    expect(session).toBeDefined();
    expect(session.pauses).toHaveLength(1);
    expect(typeof session.pauses[0].start).toBe("string");

    await stopTracking(TEST_SESSION_PATH);
  });

  it("closes the current pause with an end date", async () => {
    await startTracking(TEST_SESSION_PATH);

    markInactivity(TEST_SESSION_PATH);
    markActivity(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    const session = data.sessions[0];
    const pause = session.pauses?.[0];

    expect(pause).toBeDefined();
    expect(typeof pause.start).toBe("string");
    expect(typeof pause.end).toBe("string");

    await stopTracking(TEST_SESSION_PATH);
  });

  it("gère plusieurs pauses dans la même session", async () => {
    await startTracking(TEST_SESSION_PATH);

    // Pause 1
    markInactivity(TEST_SESSION_PATH);
    markActivity(TEST_SESSION_PATH);

    // Pause 2
    markInactivity(TEST_SESSION_PATH);
    markActivity(TEST_SESSION_PATH);

    // Pause 3
    markInactivity(TEST_SESSION_PATH);
    markActivity(TEST_SESSION_PATH);

    const data = readDataFromFile(TEST_SESSION_PATH);
    const session = data.sessions[0];

    expect(session).toBeDefined();
    expect(session.pauses).toHaveLength(3);

    session.pauses.forEach((pause, index) => {
      expect(typeof pause.start).toBe("string");
      expect(typeof pause.end).toBe("string");
      if (index > 0) {
        expect(
          new Date(pause.start) >= new Date(session.pauses[index - 1].end)
        ).toBe(true);
      }
    });

    await stopTracking(TEST_SESSION_PATH);
  });
  it("should stop triggering inactivity/activity after stopTracking", async () => {
    await startTracking(TEST_SESSION_PATH);

    const inactivitySpy = vi.spyOn(
      await import("../lib/storage/watcher.js"),
      "markInactivity"
    );
    const activitySpy = vi.spyOn(
      await import("../lib/storage/watcher.js"),
      "markActivity"
    );

    await stopTracking(TEST_SESSION_PATH);

    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(inactivitySpy).not.toHaveBeenCalled();
    expect(activitySpy).not.toHaveBeenCalled();
  });
});
