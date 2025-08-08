//@ts-nocheck
import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, vi } from "vitest";
import readline from "readline";

import { uninstallTrackDevTime } from "../lib/commands/uninstall";

const TEST_DIR = path.resolve("test_data/setup");
const PACKAGE_JSON_PATH = path.join(TEST_DIR, "package.json");
const GITIGNORE_PATH = path.join(TEST_DIR, ".gitignore");
const SESSION_PATH = path.join(TEST_DIR, ".track-dev-time/sessions.json");
const CONFIG_PATH = path.join(TEST_DIR, ".track-dev-time/config.json");

beforeEach(() => {
  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(TEST_DIR, { recursive: true });

  fs.mkdirSync(path.join(TEST_DIR, ".track-dev-time"));
  fs.writeFileSync(
    path.join(TEST_DIR, ".gitignore"),
    "node_modules\n.track-dev-time/\n"
  );
  fs.writeFileSync(
    path.join(TEST_DIR, "package.json"),
    JSON.stringify({
      scripts: { dev: "next dev" },
      trackDevTimeBackupDevScript: "next dev",
    })
  );
});

describe("uninstallTrackDevTime", () => {
  it("aborts uninstall when user answers no", () => {
    // Mock readline pour réponse 'n'
    const questionMock = vi.fn((q, cb) => cb("n"));
    const rlMock = { question: questionMock, close: vi.fn() };
    vi.spyOn(readline, "createInterface").mockReturnValue(rlMock);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    uninstallTrackDevTime(TEST_DIR);

    expect(questionMock).toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith("❌ Uninstall aborted.");

    expect(fs.existsSync(path.join(TEST_DIR, ".track-dev-time"))).toBe(true);
  });

  it("removes files and restores scripts when user confirms", () => {
    const questionMock = vi.fn((q, cb) => cb("y"));
    const rlMock = { question: questionMock, close: vi.fn() };
    vi.spyOn(readline, "createInterface").mockReturnValue(rlMock);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    uninstallTrackDevTime(TEST_DIR);

    expect(fs.existsSync(path.join(TEST_DIR, ".track-dev-time"))).toBe(false);

    const gitignore = fs.readFileSync(
      path.join(TEST_DIR, ".gitignore"),
      "utf-8"
    );

    expect(gitignore).not.toContain(".track-dev-time/");

    const pkg = JSON.parse(
      fs.readFileSync(path.join(TEST_DIR, "package.json"), "utf-8")
    );

    expect(pkg.trackDevTimeBackupDevScript).toBeUndefined();
    expect(pkg.scripts.dev).toBe("next dev");

    expect(logSpy).toHaveBeenCalledWith("✔️ Removed .track-dev-time folder");
    expect(logSpy).toHaveBeenCalledWith("✔️ Cleaned .gitignore");
    expect(logSpy).toHaveBeenCalledWith("✅ 'dev' script restored to original");
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("Uninstall complete")
    );
  });
});
