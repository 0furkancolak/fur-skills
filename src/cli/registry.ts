import type { FurCommand } from "../core/command.ts";
import { defineCommand } from "../core/command.ts";
import { cmdEval } from "./eval.ts";
import { printHelp } from "./help.ts";
import { cmdInit } from "./init.ts";
import { cmdInstall, cmdUninstall } from "./install.ts";
import { cmdCompact } from "./compact.ts";
import { cmdDoctorLocal } from "./doctor-local.ts";
import { cmdProgress, cmdRefresh } from "./progress.ts";
import { cmdRepoDoctor } from "./repo-doctor.ts";
import {
  cmdWorkspaceDoctor,
  cmdWorkspaceInit,
} from "./workspace.ts";

async function runWorkspace(args: string[]): Promise<number> {
  const sub = args[0];
  if (sub === "init") return cmdWorkspaceInit();
  if (sub === "doctor") return cmdWorkspaceDoctor();
  console.error("Usage:\n  fur workspace init\n  fur workspace doctor");
  return 1;
}

function buildCommands(): FurCommand[] {
  return [
    defineCommand("help", async () => {
      printHelp();
      return 0;
    }, ["--help", "-h"]),
    defineCommand("init", cmdInit),
    defineCommand("workspace", runWorkspace),
    defineCommand("refresh", async () => cmdRefresh()),
    defineCommand("progress", async () => cmdProgress()),
    defineCommand("compact", async () => cmdCompact()),
    defineCommand("doctor", async () => cmdDoctorLocal()),
    defineCommand("install", cmdInstall),
    defineCommand("uninstall", async () => cmdUninstall()),
    defineCommand("repo-doctor", cmdRepoDoctor),
    defineCommand("eval", cmdEval),
  ];
}

export class CommandRegistry {
  private readonly byName = new Map<string, FurCommand>();

  constructor(commands: FurCommand[] = buildCommands()) {
    for (const command of commands) {
      this.byName.set(command.name, command);
      for (const alias of command.aliases ?? []) {
        this.byName.set(alias, command);
      }
    }
  }

  resolve(name: string): FurCommand | undefined {
    return this.byName.get(name);
  }

  listNames(): string[] {
    const names = new Set<string>();
    for (const command of this.byName.values()) {
      names.add(command.name);
    }
    return [...names].sort();
  }
}
