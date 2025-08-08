import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { getApiKey } from "../lib/commands/auth";

vi.mock("fs");

describe("getApiKey", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the API key from the config file", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ apiKey: "abc123" })
    );

    expect(getApiKey()).toBe("abc123");
  });

  it("returns null if the config file does not exist", () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    expect(getApiKey()).toBeNull();
  });

  it("returns null if the API key is missing in the config file", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({}));

    expect(getApiKey()).toBeNull();
  });

  it("throws an error if the config file contains malformed JSON", () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readFileSync).mockReturnValue("{ apiKey: ");

    expect(() => getApiKey()).toThrow();
  });
});
