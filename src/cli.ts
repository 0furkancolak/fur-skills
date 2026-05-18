#!/usr/bin/env bun
import { CommandRegistry } from "./cli/registry.ts";

const registry = new CommandRegistry();

async function main(): Promise<number> {
  const args = process.argv.slice(2);
  const commandName = args[0] ?? "help";
  const commandArgs = args.slice(1);

  const command = registry.resolve(commandName);
  if (!command) {
    console.error(`Unknown command: ${commandName}`);
    console.error("");
    const { printHelp } = await import("./cli/help.ts");
    printHelp();
    return 1;
  }

  return command.run(commandArgs);
}

const exitCode = await main();
process.exit(exitCode);
