import fs from "fs";
import path from "path";

export const setupPackage = () => {
  console.log("Setting up track-dev-time...");
  updatePackageJsonScripts();
  updateGitignore();
  console.log("✅ Setup completed!");
};

const updatePackageJsonScripts = () => {
  const packageJsonPath = path.resolve("package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ No package.json found.");
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (!packageJson.scripts || !packageJson.scripts.dev) {
    console.error("❌ No 'dev' script found in package.json.");
    return;
  }

  const initialScriptDev = packageJson.scripts.dev;

  if (
    initialScriptDev.includes("track-dev-time start") &&
    initialScriptDev.includes("concurrently")
  ) {
    console.log(
      "ℹ️ The 'dev' script already uses concurrently with 'track-dev-time start'"
    );
    return;
  }
  const newScriptDev = `concurrently -n server,track -c ,green "${initialScriptDev}" "track-dev-time start"`;

  packageJson.scripts.dev = newScriptDev;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf-8"
  );
  console.log("✅ 'dev' script modified to use concurrently in package.json");
};

const updateGitignore = () => {
  const gitignorePath = path.resolve(".gitignore");
  const ignoreLine = ".track-dev-time/";

  if (fs.existsSync(gitignorePath)) {
    const current = fs.readFileSync(gitignorePath, "utf-8");
    if (!current.includes(ignoreLine)) {
      fs.appendFileSync(gitignorePath, `\n${ignoreLine}`);
      console.log(`✅ ${ignoreLine} added to .gitignore`);
    } else {
      console.log(`ℹ️ ${ignoreLine} already in .gitignore`);
    }
  } else {
    fs.writeFileSync(gitignorePath, `${ignoreLine}\n`);
    console.log(`✅ .gitignore file created with ${ignoreLine}`);
  }
};
