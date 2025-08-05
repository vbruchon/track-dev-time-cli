import { CONFIG_PATH } from "./constants";
import { readDataFromFile } from "./file-storage";

export const getConfig = () => {
  return readDataFromFile(CONFIG_PATH);
};
