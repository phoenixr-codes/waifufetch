/** Repeats a character sequence of a string until a certain length is reached. */
export function repeatStringUntilLengthReached(str: string, length: number): string {
  let result = ""
  while (true) {
    for (const char of str) {
      result += char;
      if (Bun.stringWidth(result) >= length) return result;
    }
  }
}

/** Returns the width of widest string in an array. */
export function maxWidth(text: string[]): number {
  let width = 0;
  for (const line of text) {
    width = Math.max(width, Bun.stringWidth(line));
  }
  return width;
}

export type CenterLinesVerticallyOptions = {
  content?: string
}

/** Centers lines vertically by prepending and appending lines. */
export function centerLinesVertically(lines: string[], maxHeight: number, options: CenterLinesVerticallyOptions): string[] {
  const spaceAround = maxHeight - lines.length;
  const extraSpace = Math.max(1, Math.floor(spaceAround / 2));
  let result = []
  result.push(...Array(extraSpace).fill(options.content ?? ""));
  result = result.concat(lines);
  result.push(...Array(extraSpace).fill(options.content ?? ""));
  return result;
}

/** Center lines horizontally by prepending and appending each line with space. */
export function centerLinesHorizontally(lines: string[], maxWidth: number): string[] {
  return lines.map((line) => {
    const spaceAround = maxWidth - Bun.stringWidth(line);
    const extraSpace = Math.max(0, Math.floor(spaceAround / 2));
    return " ".repeat(extraSpace) + line + " ".repeat(extraSpace);
  });
}
