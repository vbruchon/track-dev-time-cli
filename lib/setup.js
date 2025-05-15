import fs from "fs";
import path from "path";

export const setupPackage = () => {
  console.log("Setup de track-dev-time en cours...");
  updatePackageJsonScripts();
  updateGitignore();
  console.log("✅ Setup terminée !");
};

const updatePackageJsonScripts = () => {
  const packageJsonPath = path.resolve("package.json");

  if (!fs.existsSync(packageJsonPath)) {
    console.error("❌ Aucun package.json trouvé.");
    return;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

  if (!packageJson.scripts || !packageJson.scripts.dev) {
    console.error("❌ Aucun script 'dev' trouvé dans package.json.");
    return;
  }

  const initialScriptDev = packageJson.scripts.dev;
  packageJson.scripts.dev = `${initialScriptDev} && track-dev-time start`;

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJson, null, 2),
    "utf-8"
  );
  console.log("✅ Script 'dev' modifié dans package.json");
};

const updateGitignore = () => {
  const gitignorePath = path.resolve(".gitignore");
  const ignoreLine = "track-dev-time/";

  if (fs.existsSync(gitignorePath)) {
    const current = fs.readFileSync(gitignorePath, "utf-8");
    if (!current.includes(ignoreLine)) {
      fs.appendFileSync(gitignorePath, `\n${ignoreLine}`);
      console.log(`✅ ${ignoreLine} ajouté à .gitignore`);
    } else {
      console.log(`ℹ️ ${ignoreLine} déjà dans .gitignore`);
    }
  } else {
    fs.writeFileSync(gitignorePath, `${ignoreLine}\n`);
    console.log(`✅ Fichier .gitignore créé avec ${ignoreLine}`);
  }
};
