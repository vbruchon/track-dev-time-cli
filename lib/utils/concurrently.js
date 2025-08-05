//@ts-nocheck
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from "readline";
import { writeDataToFile } from "./file-storage";
import { META_PATH } from "./constants";

const packageJsonPath = path.resolve("package.json");

export const detectPackageManager = () => {
  if (fs.existsSync(path.resolve("pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.resolve("yarn.lock"))) return "yarn";
  return "npm";
};

export const isConcurrentlyInstalled = () => {
  if (!fs.existsSync(packageJsonPath)) return false;
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  return Boolean(deps["concurrently"]);
};

const askUserConfirmation = (question) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${question} (y/N) `, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
};

export const installConcurrently = async () => {
  const pkgManager = detectPackageManager();
  let installCmd = "";

  switch (pkgManager) {
    case "yarn":
      installCmd = "yarn add -D concurrently";
      break;
    case "pnpm":
      installCmd = "pnpm add -D concurrently";
      break;
    case "npm":
    default:
      installCmd = "npm install concurrently --save-dev";
  }

  const confirm = await askUserConfirmation(
    `The package 'concurrently' is not installed. Do you want to install it with this command: ${installCmd} ?`
  );

  if (!confirm) {
    console.log("ℹ️ 'concurrently' installation cancelled by user.");
    return;
  }

  try {
    console.log(`⚙️ Installing 'concurrently' using ${pkgManager}...`);
    execSync(installCmd, { stdio: "inherit" });
    console.log("✅ 'concurrently' installed successfully!");

    if (!fs.existsSync(metaDir)) {
      fs.mkdirSync(metaDir, { recursive: true });
    }

    writeDataToFile({ concurrentlyInstalledByCli: true }, META_PATH);

    console.log("📝 Wrote meta.json with install info");
  } catch (error) {
    console.error("❌ Failed to install 'concurrently':", error);
  }
};
