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
    // Isolation du dossier de test
    setupTestEnvironment(TEST_DIR, TEST_PACKAGE_JSON, TEST_GITIGNORE);
    mockLog(logSpy, errorSpy);
  });

  afterEach(() => {
    // Restore console
    restoreMockLog(logSpy, errorSpy);
    // Nettoyage
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
    process.chdir(originalCwd);
  });

  it("should update the dev script in package.json and log the change", () => {
    setupPackage();

    const pkg = JSON.parse(fs.readFileSync(TEST_PACKAGE_JSON, "utf-8"));
    expect(pkg.scripts.dev).toBe("next dev && track-dev-time start");

    // Vérifie qu'on a bien loggé la modification
    expect(logSpy).toHaveBeenCalledWith(
      "✅ Script 'dev' modifié dans package.json"
    );
  });

  it("should add track-dev-time/ to .gitignore and log the addition", () => {
    setupPackage();

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8");
    expect(gitignore).toContain("track-dev-time/");

    expect(logSpy).toHaveBeenCalledWith(
      "✅ track-dev-time/ ajouté à .gitignore"
    );
  });

  it("should not duplicate track-dev-time/ in .gitignore and log info", () => {
    // On ajoute déjà la ligne une fois
    fs.writeFileSync(
      TEST_GITIGNORE,
      "node_modules\ntrack-dev-time/\n",
      "utf-8"
    );

    setupPackage();

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8");
    expect((gitignore.match(/track-dev-time\//g) || []).length).toBe(1);

    // Vérifie qu'on a loggué qu'elle existait déjà
    expect(logSpy).toHaveBeenCalledWith(
      "ℹ️ track-dev-time/ déjà dans .gitignore"
    );
  });

  it("should create .gitignore if missing and log creation", () => {
    fs.unlinkSync(TEST_GITIGNORE);
    setupPackage();

    const gitignore = fs.readFileSync(TEST_GITIGNORE, "utf-8").trim();
    expect(gitignore).toBe("track-dev-time/");

    expect(logSpy).toHaveBeenCalledWith(
      "✅ Fichier .gitignore créé avec track-dev-time/"
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

    // Log vérifiant l'idempotence
    expect(logSpy).toHaveBeenCalledWith(
      "ℹ️ Le script 'dev' contient déjà 'track-dev-time start'"
    );
    expect(logSpy).toHaveBeenCalledWith(
      "ℹ️ track-dev-time/ déjà dans .gitignore"
    );
  });
});
