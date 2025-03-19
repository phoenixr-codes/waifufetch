import type { Config } from "./config.ts";
import cliui from "cliui";
import { repeatStringUntilLengthReached, maxWidth, centerLinesVertically, centerLinesHorizontally } from './utils.ts'


/** Draws the output to standard output. */
export function draw(config: Config) {
  const ui = cliui({ width: process.stdout.columns, wrap: false });

  // logo setup
  const logo = config.logo;
  const logoWidth = maxWidth(logo.split("\n"));
  const logoHeight = logo.split("\n").length;

  // dashboard setup
  type Line = { "text": string } | { "fill": string }
  let lines: Line[] = [];
  for (const content of (config.dashboard)) {
    if ("divider" in content) {
      lines.push({ fill: content.divider });
    } else if (content.icon === undefined) {
      lines.push({ text: content.text });
    } else {
      lines.push({ text: `${content.icon}${" ".repeat(config.style.dashboard.spaceBetween)}${content.text}` });
    }
  }
  const dashboardWidth = maxWidth(lines.filter((line) => "text" in line).map((line) => line.text));
  let display = lines.map((line) => {
    if ("text" in line) {
      const extraTrailingSpace = dashboardWidth - Bun.stringWidth(line.text);
      return line.text + " ".repeat(extraTrailingSpace);
    } else {
      return repeatStringUntilLengthReached(line.fill, dashboardWidth);
    }
  });

  // center dashboard vertically/horizontally
  switch (config.style.orientation) {
    case "horizontal":
      display = centerLinesVertically(display, logoHeight, { content: " ".repeat(dashboardWidth) });
      break;
    case "vertical":
      display = centerLinesHorizontally(display, logoWidth);
      break;
  }

  const elements = {
    logo: { text: logo, width: logoWidth, padding: config.style.logo.padding },
    dashboard: { text: display.join("\n"), width: dashboardWidth, padding: config.style.dashboard.padding },
  };

  switch (config.style.orientation) {
    case "horizontal":
      ui.div(elements[config.style.elements[0]], elements[config.style.elements[1]]);
      break;
    case "vertical":
      ui.div(elements[config.style.elements[0]]);
      ui.div(elements[config.style.elements[1]]);
      break;
  }

  console.log(ui.toString());
}
