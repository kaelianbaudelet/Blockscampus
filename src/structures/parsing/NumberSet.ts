export class NumberSet {
  static parse(value: string): number[] {
    if (!value?.startsWith("[") || !value.endsWith("]")) return [];

    const inside = value.slice(1, -1).trim();
    if (!inside) return [];

    const result: number[] = [];

    for (const part of inside.split(",")) {
      const [startStr, endStr] = part.split("..").map((s) => s.trim());
      const start = Number(startStr);
      const end = Number(endStr);

      if (Number.isNaN(start)) continue;

      if (Number.isNaN(end)) {
        result.push(start);
        continue;
      }

      for (let n = start; n <= end; n++) {
        result.push(n);
      }
    }

    return result;
  }

  /** Encodes a list of numbers as a compact set, e.g. `[1..4,7]`. */
  static encode(values: number[]): string {
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    const parts: string[] = [];

    for (let i = 0; i < sorted.length; i++) {
      const start = sorted[i]!;
      let end = start;
      while (sorted[i + 1] === end + 1) {
        end = sorted[++i]!;
      }
      parts.push(start === end ? String(start) : `${start}..${end}`);
    }

    return `[${parts.join(",")}]`;
  }
}
