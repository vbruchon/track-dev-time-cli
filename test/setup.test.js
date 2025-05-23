// tests/setup.test.js
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "fs";
import path from "path";
import { setupPackage } from "../lib/setup.js";
import { mockLog, restoreMockLog, setupTestEnvironment } from "./utils.js";

const TEST_DIR = path.resolve("./tests/tmp");
const TEST_PACKAGE_JSON = path.join(TEST_DIR, "package.json");
const TEST_GITIGNORE = path.join(TEST_DIR, ".gitignore");
const originalCwd = process.cwd();

describe("setupPackage()", () => {
  let logSpy;
  let errorSpy;

  beforeEach(() => {
    setupTestEnvironment(TEST_DIR, TEST_PACKAGE_JSON, TEST_GITIGNORE);
    process.chdir(TEST_DIR);
    ({ logSpy, errorSpy } = mockLog());
  });

  afterEach(() => {
    restoreMockLog(logSpy, errorSpy);
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    process.chdir(originalCwd);
  });

  it("should update the dev script in package.json and log the change", () => {
    setupPackage();

    const pkg = JSON.parse(fs.readFileSync(TEST_PACKAGE_JSON, "utf-8"));
    expect(pkg.scripts.dev).toBe("next dev && track-dev-time start");

    expect(logSpy).toHaveBeenCalledWith(
      "✅ 'dev' script modified in package.json"
    );
  });

  it("should add track-dev-time/ to .gitignore and log the addition", () => {
    setupPackage();

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8");
    expect(gitignore).toContain("track-dev-time/");

    expect(logSpy).toHaveBeenCalledWith(
      "✅ track-dev-time/ added to .gitignore"
    );
  });

  it("should not duplicate track-dev-time/ in .gitignore and log info", () => {
    fs.writeFileSync(
      TEST_GITIGNORE,
      "node_modules\ntrack-dev-time/\n",
      "utf-8"
    );

    setupPackage();

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8");
    expect((gitignore.match(/track-dev-time\//g) || []).length).toBe(1);

    expect(logSpy).toHaveBeenCalledWith(
      "ℹ️ track-dev-time/ already in .gitignore"
    );
  });

  it("should create .gitignore if missing and log creation", () => {
    fs.unlinkSync(TEST_GITIGNORE);
    setupPackage();

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8").trim();
    expect(gitignore).toBe("track-dev-time/");

    expect(logSpy).toHaveBeenCalledWith(
      "✅ .gitignore file created with track-dev-time/"
    );
  });

  it("does not duplicate changes when called multiple times", () => {
    setupPackage();
    setupPackage();
    setupPackage();

    const pkg = JSON.parse(fs.readFileSync(TEST_PACKAGE_JSON, "utf-8"));
    expect((pkg.scripts.dev.match(/track-dev-time start/g) || []).length).toBe(
      1
    );

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8");
    expect((gitignore.match(/track-dev-time\//g) || []).length).toBe(1);

    expect(logSpy).toHaveBeenCalledWith(
      "ℹ️ The 'dev' script already contains 'track-dev-time start'"
    );
    expect(logSpy).toHaveBeenCalledWith(
      "ℹ️ track-dev-time/ already in .gitignore"
    );
  });
});
