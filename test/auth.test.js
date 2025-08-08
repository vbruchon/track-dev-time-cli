//@ts-nocheck
import fs from "fs";
import os from "os";
import path from "path";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import readline from "readline";
import { handleAuthCommand } from "../lib/commands/auth";

const CONFIG_DIR = path.join(os.homedir(), ".track-dev-time");
const CONFIG_PATH = path.join(CONFIG_DIR, "config.json");

describe("auth command --apikey", () => {
  beforeEach(() => {
    if (fs.existsSync(CONFIG_DIR)) {
      fs.rmSync(CONFIG_DIR, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates config.json with the correct key", () => {
    handleAuthCommand({ apikey: "my-secret-key" });

    expect(fs.existsSync(CONFIG_PATH)).toBe(true);
    const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    expect(saved.apiKey).toBe("my-secret-key");
  });

  it("prompts for confirmation before overwriting if a different key already exists", async () => {
    // Ecrire une clé existante différente
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey: "old-key" }));

    // Mock readline pour simuler la réponse 'y'
    const questionMock = vi.fn((questionText, cb) => cb("y"));
    const rlMock = {
      question: questionMock,
      close: vi.fn(),
    };
    vi.spyOn(readline, "createInterface").mockReturnValue(rlMock);

    // Spy console.log pour vérifier message de succès
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    handleAuthCommand({ apikey: "new-key" });

    expect(questionMock).toHaveBeenCalledWith(
      expect.stringContaining("Do you want to overwrite"),
      expect.any(Function)
    );

    // Clé mise à jour
    const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    expect(saved.apiKey).toBe("new-key");
    expect(logSpy).toHaveBeenCalledWith("✅ API key saved successfully!");
  });

  it("aborts overwrite if the response is not 'y'", () => {
    // Ecrire une clé existante différente
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_PATH, JSON.stringify({ apiKey: "old-key" }));

    // Mock readline pour simuler la réponse 'n'
    const questionMock = vi.fn((questionText, cb) => cb("n"));
    const rlMock = {
      question: questionMock,
      close: vi.fn(),
    };
    vi.spyOn(readline, "createInterface").mockReturnValue(rlMock);

    // Spy console.log et process.exit
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    // Doit appeler process.exit(0) => on catch l'erreur pour continuer le test
    expect(() => handleAuthCommand({ apikey: "new-key" })).toThrow(
      "process.exit called"
    );

    expect(logSpy).toHaveBeenCalledWith(
      "❌ Operation aborted, API key was not changed."
    );

    // La clé ne doit pas avoir changé
    const saved = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
    expect(saved.apiKey).toBe("old-key");

    exitSpy.mockRestore();
  });

  it("displays a clear message if the apikey is missing", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const exitSpy = vi.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });

    expect(() => handleAuthCommand({})).toThrow("process.exit called");

    expect(errorSpy).toHaveBeenCalledWith(
      "❌ No API key provided. Use --apikey <key>"
    );

    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
