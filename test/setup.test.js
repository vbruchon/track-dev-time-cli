import fs from "fs";
import path from "path";
import { describe, it, expect, beforeEach, vi } from "vitest";

// Dossiers et chemins de test
const TEST_DIR = path.resolve("test_data/setup");
const PACKAGE_JSON_PATH = path.join(TEST_DIR, "package.json");
const GITIGNORE_PATH = path.join(TEST_DIR, ".gitignore");
const SESSION_PATH = path.join(TEST_DIR, ".track-dev-time/sessions.json");
const CONFIG_PATH = path.join(TEST_DIR, ".track-dev-time/config.json");

vi.mock("../lib/utils/concurrently.js", () => ({
  isConcurrentlyInstalled: vi.fn(() => true),
  installConcurrently: vi.fn(async () => Promise.resolve()),
}));

vi.mock("readline", () => {
  return {
    createInterface: () => ({
      question: (questionText, cb) => cb("y"), // Répond "y" automatiquement
      close: () => {},
    }),
  };
});

import { setupPackage } from "../lib/commands/setup";
import { writeConfigJson, writePackageJson } from "./utils";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();

  if (fs.existsSync(TEST_DIR)) fs.rmSync(TEST_DIR, { recursive: true });
  fs.mkdirSync(TEST_DIR, { recursive: true });

  writePackageJson(PACKAGE_JSON_PATH);
  const configDir = path.dirname(CONFIG_PATH);

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  writeConfigJson(CONFIG_PATH);
});

describe("setupPackage", () => {
  it("crée le dossier .track-dev-time et les fichiers sessions/config", async () => {
    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    expect(fs.existsSync(path.dirname(SESSION_PATH))).toBe(true);
    expect(fs.existsSync(SESSION_PATH)).toBe(true);
    expect(fs.existsSync(CONFIG_PATH)).toBe(true);
  });

  it("sauvegarde l’ancien script dev dans trackDevTimeBackupDevScript", async () => {
    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    expect(pkg.trackDevTimeBackupDevScript).toBe("next dev");
  });

  it("affiche une erreur si pas de script dev", async () => {
    fs.writeFileSync(
      PACKAGE_JSON_PATH,
      JSON.stringify({ name: "test", scripts: {} }, null, 2)
    );

    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    expect(consoleError).toHaveBeenCalledWith(
      "❌ No 'dev' script found in package.json."
    );
  });

  it("sauvegarde l’ancien script dev dans trackDevTimeBackupDevScript", async () => {
    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    expect(pkg.trackDevTimeBackupDevScript).toBe("next dev");
  });

  it("modifie le script dev avec concurrently et track-dev-time", async () => {
    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));

    expect(pkg.scripts.dev).toContain("concurrently");
    expect(pkg.scripts.dev).toContain("track-dev-time start");
  });

  it("n’écrase pas un script dev déjà modifié avec track-dev-time", async () => {
    writePackageJson({
      dev: 'concurrently "next dev" "track-dev-time start"',
    });

    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    const pkg = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf-8"));
    expect(pkg.trackDevTimeBackupDevScript).toBeUndefined();
  });

  it("ajoute .track-dev-time/ dans .gitignore s’il n’y est pas déjà", async () => {
    fs.writeFileSync(GITIGNORE_PATH, "node_modules\n");

    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    const gitignoreContent = fs.readFileSync(GITIGNORE_PATH, "utf-8");
    expect(gitignoreContent).toMatch(/\.track-dev-time\//);
  });

  it("ne réécrit pas .gitignore si .track-dev-time/ y est déjà présent", async () => {
    fs.writeFileSync(GITIGNORE_PATH, ".track-dev-time/\n");

    const appendSpy = vi.spyOn(fs, "appendFileSync");

    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    expect(appendSpy).not.toHaveBeenCalled();
  });

  it("crée .gitignore si absent", async () => {
    await setupPackage({
      sessionsPath: SESSION_PATH,
      configPath: CONFIG_PATH,
      packageJsonPath: PACKAGE_JSON_PATH,
      gitignorePath: GITIGNORE_PATH,
    });

    const gitignoreContent = fs.readFileSync(GITIGNORE_PATH, "utf-8");
    expect(gitignoreContent).toMatch(/\.track-dev-time\//);
  });
});
