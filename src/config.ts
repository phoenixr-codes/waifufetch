import { homedir } from "os";
import path from "path";
import { z } from "zod";

var args: string[];

/** A pair of icon and text or just text. */
const Content = z.object({
  icon: z.optional(z.string()),
  text: z.string(),
});

export type Content = z.infer<typeof Content>;

/** A divider that separates a set of contents. */
const Divider = z.object({ divider: z.string() });

export type Divider = z.infer<typeof Divider>;

/** Configuration for the appearance. */
const Style = z.object({
  /** Whether to layout horizontally or vertically. */
  orientation: z.enum(["horizontal", "vertical"]),
  /** The order of the elements in the layout. */
  elements: z.union([
    z.tuple([z.literal("logo"), z.literal("dashboard")] as const),
    z.tuple([z.literal("dashboard"), z.literal("logo")]),
  ]),
  /** Styling related to the logo. */
  logo: z.object({
    /** The padding around the logo (`[top, right, bottom, left]`). */
    padding: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  }),
  /** Styling related to the dashboard. */
  dashboard: z.object({
    /** The padding around the dashboard (`[top, right, bottom, left]`). */
    padding: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    /** The amount of spaces to insert between icons and text. */
    spaceBetween: z.number(),
  }),
});

export type Style = z.infer<typeof Style>;

/** A row in the dashboard. */
const Row = z.union([Content, Divider]);

export type Row = z.infer<typeof Row>;

/** The overall configuration. */
const Config = z.object({
  /** The ASCII/ANSI art logo to display. */
  logo: z.string(),
  /** The content of the dashboard. */
  dashboard: z.array(Row),
  /** Configuration for the appearance. */
  style: Style,
});

export type Config = z.infer<typeof Config>;

/** The default configuration paths. */
function defaultConfigPaths(): string[] {
  return [
    path.join(homedir(), ".config/waifufetch/config.ts"),
    path.join(homedir(), ".config/waifufetch/config.js"),
    path.join(homedir(), ".config/waifufetch/config.json"),
  ]
}

/** Loads the configuration from a default or custom path and uses fallback values on missing options. */
export async function loadConfig(args: string[]): Promise<Config> {
  let configPathCandidates: string[];
  const customConfigPath: string | undefined = process.env.WAIFUFETCH_CONFIG;
  if (customConfigPath === undefined) {
    configPathCandidates = defaultConfigPaths();
  } else {
    if (!await Bun.file(customConfigPath).exists()) {
      throw `Configuration file defined as \`WAIFUFETCH_CONFIG\` does not exist (${customConfigPath})`
    }
    configPathCandidates = [customConfigPath];
  }
  let userConfig = undefined;
  for (const candidate of configPathCandidates) {
    if (await Bun.file(candidate).exists()) {
      globalThis.args = args;
      userConfig = (await import(candidate)).default;
      break;
    }
  }
  if (userConfig === undefined) {
    throw "Didn't find a configuration file. Generate one with `waifufetch generate-config`."
  }
  const config = Config.parse(userConfig);
  return config;
}

/** The fallback configuration with some defaults. */
export const fallbackConfig: Config = {
  logo: "",
  dashboard: [
    { icon: "\uf4bc", text: process.arch },
    { icon: "\uebc6", text: process.platform }
  ],
  style: {
    orientation: "horizontal",
    elements: ["logo", "dashboard"],
    logo: {
      padding: [0, 5, 0, 2],
    },
    dashboard: {
      padding: [0, 0, 0, 0],
      spaceBetween: 3,
    }
  },
};

