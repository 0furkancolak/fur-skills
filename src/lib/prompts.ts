import * as readline from "node:readline/promises";

export function isTty(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

export async function promptChoice(
  prompt: string,
  defaultValue: string,
): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    const answer = await rl.question(`${prompt} [${defaultValue}]: `);
    return answer.trim() === "" ? defaultValue : answer.trim();
  } finally {
    rl.close();
  }
}

export function validQuestionLevel(v: string): boolean {
  return v === "low" || v === "normal" || v === "high";
}

export function validProjectMaturity(v: string): boolean {
  return v === "new" || v === "established";
}

export function validResponseDepth(v: string): boolean {
  return v === "concise" || v === "standard" || v === "deep";
}

export function validEvidenceStyle(v: string): boolean {
  return (
    v === "paths-only" || v === "inline" || v === "inline-plus-paths"
  );
}

export function validVerificationStrictness(v: string): boolean {
  return v === "loose" || v === "normal" || v === "strict";
}

export function validAutomationMode(v: string): boolean {
  return v === "guided" || v === "streamlined";
}

export function parseGitignoreAnswer(answer: string): "--gitignore" | "--no-gitignore" | null {
  const a = answer.toLowerCase();
  if (["y", "yes"].includes(a)) return "--gitignore";
  if (["n", "no"].includes(a)) return "--no-gitignore";
  return null;
}
