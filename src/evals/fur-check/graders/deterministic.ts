#!/usr/bin/env bun
import { runGraderCli } from "../../../quality/grader-cli.ts";

process.exit(await runGraderCli("fur-check"));
