#!/usr/bin/env node
import { Command } from "commander";
import { startTracking, stopTracking } from "../lib/index.js";

const program = new Command();

program.name("tdt").description("Track Dev Time CLI").version("0.0.1");

program
  .command("start")
  .description("Start coding session")
  .action(startTracking);
program
  .command("stop")
  .description("Stop and save session")
  .action(stopTracking);

program.parse(process.argv);
