import { CONFIG_PATH } from "./constants.js";
import { readDataFromFile } from "./file-storage.js";

export const getConfig = () => {
  return readDataFromFile(CONFIG_PATH);
};
