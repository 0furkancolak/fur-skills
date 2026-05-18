/** CLI command contract (Command pattern). */
export interface FurCommand {
  readonly name: string;
  readonly aliases?: readonly string[];
  run(args: string[]): Promise<number>;
}

export type CommandHandler = (args: string[]) => Promise<number>;

export function defineCommand(
  name: string,
  run: CommandHandler,
  aliases?: readonly string[],
): FurCommand {
  return { name, run, aliases };
}
