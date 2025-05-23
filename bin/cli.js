#!/usr/bin/env node
import { Command } from "commander";
import { listTracking, startTracking, stopTracking } from "../lib/index.js";
import { setupPackage } from "../lib/setup.js";

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

program.parse(process.argv);

// Ajouter une commande list (liste toutes les sessions)
