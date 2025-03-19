import { Command } from "commander";
import { loadConfig } from "./config";
import { draw } from "./draw";
import consola from "consola";
import path from "path";
import fs from "fs/promises";
import { $ } from "bun";
import type { ShellError } from "bun";
import { homedir } from "os";
import { mkdir } from "fs/promises";

const cli = new Command();

cli.name("waifufetch").description("A neofetch alternative");

cli.command("run", { isDefault: true }).action(async () => {
  const config = await loadConfig();
  draw(config);
});

cli.command("generate-config").description("generate default configuration").action(async () => {
  const configDirectory = path.join(homedir(), ".config/waifufetch");
  await mkdir(configDirectory, { recursive: true });
  if ((await fs.readdir(configDirectory)).length > 0) {
    consola.error(`Refusing to generate config as '${configDirectory}' is not empty`);
    return;
  }
  try {
    await $`git clone https://github.com/phoenixr-codes/waifufetch-config.git ${configDirectory}`;
    await $`bun install --cwd ${configDirectory}`;
  } catch (err) {
    const error = err as ShellError;
    consola.error(`Failed to clone repository with code ${error.exitCode}`);
    consola.error(error.stderr.toString());
    return;
  }
  consola.success(`Created default config at '${configDirectory}'`);
  Bun.openInEditor(path.join(configDirectory, "config.ts"));
});

export default cli;
