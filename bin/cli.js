#!/usr/bin/env node
import { Command } from "commander";
import { listTracking } from "../lib/commands/list-sessions.js";
import { setupPackage } from "../lib/commands/setup.js";
import { startTracking, stopTracking } from "../lib/commands/tracking.js";
import { uninstallTrackDevTime } from "../lib/commands/uninstall.js";
import { handleAuthCommand } from "../lib/commands/auth.js";

const program = new Command();

program
  .name("track-dev-time")
  .description("Track Dev Time CLI")
  .version("0.0.1");

program
  .command("start")
  .description("Start coding session")
  .action(startTracking);
program
  .command("stop")
  .description("Stop and save session")
  .action(stopTracking);
program.command("setup").description("Setup package").action(setupPackage);
program.command("list").description("List all sessions").action(listTracking);
program
  .command("uninstall")
  .description("Clean up project files and prepare for uninstall")
  .action(uninstallTrackDevTime);
program
  .command("auth")
  .description("Save your Dashboard API key globally to enable session syncing")
  .option("--apikey <key>", "Your API key from the dashboard")
  .action(handleAuthCommand);

program.parse(process.argv);
