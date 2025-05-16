import { describe, it, expect, vi } from "vitest";
import { calculTotalDuration } from "../lib/index"; // ajuste le chemin

describe("calculTotalDuration", () => {
  it("calcule correctement la durée sans pause", () => {
    const session = {
      start: new Date("2024-01-01T10:00:00Z").toISOString(),
      end: new Date("2024-01-01T11:00:00Z").toISOString(),
      pauses: [],
    };

    const duration = calculTotalDuration(session);
    expect(duration).toBe(3600);
  });

  it("calcule la durée avec une pause", () => {
    const session = {
      start: new Date("2024-01-01T10:00:00Z").toISOString(),
      end: new Date("2024-01-01T11:00:00Z").toISOString(),
      pauses: [
        {
          start: new Date("2024-01-01T10:15:00Z").toISOString(),
          end: new Date("2024-01-01T10:30:00Z").toISOString(),
        },
      ],
    };

    const duration = calculTotalDuration(session);
    expect(duration).toBe(3600 - 900);
  });

  it("ignore les pauses incomplètes (sans end)", () => {
    const session = {
      start: new Date("2024-01-01T10:00:00Z").toISOString(),
      end: new Date("2024-01-01T11:00:00Z").toISOString(),
      pauses: [
        {
          start: new Date("2024-01-01T10:15:00Z").toISOString(),
          end: null,
        },
      ],
    };

    const duration = calculTotalDuration(session);
    expect(duration).toBe(3600);
  });
});
