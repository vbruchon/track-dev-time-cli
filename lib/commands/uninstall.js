//@ts-nocheck
import readline from "readline";
import fs from "fs";
import path from "path";
import { META_PATH } from "../utils/constants";

export const uninstallTrackDevTime = () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    "⚠️ This will remove all track-dev-time related files. Continue? (y/n): ",
    (answer) => {
      rl.close();
      const confirm = answer.trim().toLowerCase();

      if (confirm !== "y" && confirm !== "yes") {
        console.log("❌ Uninstall aborted.");
        return;
      }
      console.log("\n🧹 Uninstalling track-dev-time...");

      removeTrackingFolder();

      cleanGitignore();

      cleanPackageJson();
      removeConcurrentlyIfInstalledByCli();
      console.log("\n✅ Uninstall complete! You can now run:");
      console.log("   npm uninstall track-dev-time");

      console.log(
        "\nℹ️ If you no longer use 'concurrently' in your project, you can remove it:"
      );
      console.log("   npm uninstall concurrently\n");
    }
  );
};

const removeTrackingFolder = () => {
  const trackingFolderPath = path.resolve(".track-dev-time");

  if (fs.existsSync(trackingFolderPath)) {
    fs.rmSync(trackingFolderPath, { recursive: true, force: true });
    console.log("✔️ Removed .track-dev-time folder");
  }
};

const cleanGitignore = () => {
  const gitignorePath = path.resolve(".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf-8");
    const updated = content
      .split("\n")
      .filter((line) => !line.includes(".track-dev-time/"))
      .join("\n");

    fs.writeFileSync(gitignorePath, updated);
    console.log("✔️ Cleaned .gitignore");
  }
};

const cleanPackageJson = () => {
  const pkgJsonPath = path.resolve("package.json");
  if (fs.existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf-8"));

    if (pkg.trackDevTimeBackupDevScript) {
      pkg.scripts.dev = pkg.trackDevTimeBackupDevScript;
      delete pkg.trackDevTimeBackupDevScript;

      fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2), "utf-8");
      console.log("✅ 'dev' script restored to original");
    } else {
      console.log("ℹ️ No backup found, nothing to restore");
    }
  }
};

const removeConcurrentlyIfInstalledByCli = () => {
  if (!fs.existsSync(META_PATH)) return;

  const meta = JSON.parse(fs.readFileSync(META_PATH, "utf-8"));
  if (!meta.concurrentlyInstalledByCli) return;

  const pkgManager = detectPackageManager();
  const uninstallCmd = {
    npm: "npm uninstall concurrently",
    yarn: "yarn remove concurrently",
    pnpm: "pnpm remove concurrently",
  }[pkgManager];

  console.log(`\n🔧 Removing 'concurrently' using ${pkgManager}...`);
  try {
    execSync(uninstallCmd, { stdio: "inherit" });
    console.log("✅ 'concurrently' uninstalled");
  } catch (err) {
    console.error("❌ Failed to uninstall 'concurrently':", err);
  }
};
