import { CONFIG_PATH } from "./constants.js";
import { readDataFromFile } from "./file-storage.js";

export const getConfig = (filePath = CONFIG_PATH) => {
  return readDataFromFile(filePath);
};
