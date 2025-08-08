import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";

// Mock du prompt readline AVANT l'import de la fonction à tester
vi.mock("readline", () => {
  return {
    default: {
      createInterface: () => ({
        question: (questionText, cb) => {
          cb(mockQuestionResponse);
        },
        close: () => {},
      }),
    },
  };
});

vi.mock("child_process", () => ({
  execSync: vi.fn(),
}));

vi.mock("../lib/utils/file-storage", () => ({
  writeDataToFile: vi.fn(),
}));

let mockQuestionResponse = "y";

import { execSync } from "child_process";
import { installConcurrently } from "../lib/utils/concurrently";
import { writeDataToFile } from "../lib/utils/file-storage";

describe("installConcurrently", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQuestionResponse = "y";
  });

  it("installs with npm and writes metadata if the user accepts", async () => {
    vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
      if (typeof filePath === "string") {
        if (
          filePath.includes("yarn.lock") ||
          filePath.includes("pnpm-lock.yaml")
        ) {
          return false;
        }
        return true;
      }
      return false;
    });

    vi.spyOn(fs, "mkdirSync").mockImplementation(() => undefined);

    await installConcurrently();

    expect(execSync).toHaveBeenCalledWith(
      "npm install concurrently --save-dev",
      { stdio: "inherit" }
    );
    expect(writeDataToFile).toHaveBeenCalled();
  });

  it("does not install anything if the user declines", async () => {
    mockQuestionResponse = "n";

    await installConcurrently();

    expect(execSync).not.toHaveBeenCalled();
    expect(writeDataToFile).not.toHaveBeenCalled();
  });

  it("uses yarn if yarn.lock exists", async () => {
    mockQuestionResponse = "y";

    vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
      if (typeof filePath === "string" && filePath.includes("yarn.lock"))
        return true;
      return false;
    });

    await installConcurrently();

    expect(execSync).toHaveBeenCalledWith("yarn add -D concurrently", {
      stdio: "inherit",
    });
  });

  it("uses pnpm if pnpm-lock.yaml exists", async () => {
    mockQuestionResponse = "y";

    vi.spyOn(fs, "existsSync").mockImplementation((filePath) => {
      if (typeof filePath === "string" && filePath.includes("pnpm-lock.yaml"))
        return true;
      return false;
    });

    await installConcurrently();

    expect(execSync).toHaveBeenCalledWith("pnpm add -D concurrently", {
      stdio: "inherit",
    });
  });
});
