import { beforeEach, afterEach, vi } from "vitest";
import { createAndWriteDataFile, deleteTestFolderIfExist } from "./utils";

beforeEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
  vi.useRealTimers();

  deleteTestFolderIfExist();
  createAndWriteDataFile();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();

  deleteTestFolderIfExist();
});
