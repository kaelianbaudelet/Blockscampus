import { ParsingError } from "@/structures/errors/ParsingError";
import { DateParser } from "@/structures/parsing/DateParser";
import { NumberSet } from "@/structures/parsing/NumberSet";

export class Parser {
  static encodeType(type: number, value: string) {
    return { _T: type, V: value };
  }

  static encodeDate(value: Date) {
    return this.encodeType(7, DateParser.encodeDay(value));
  }

  static encodeSet(type: 8 | 26, values: number[]) {
    return this.encodeType(type, NumberSet.encode(values));
  }

  /**
   * Recursively converts a raw PRONOTE Campus payload:
   * - `L` becomes `label`, `N` becomes `id`
   * - typed values (`{ _T, V }`) are unwrapped and decoded
   */
  static parse<T>(obj: unknown): T {
    if (obj === null || typeof obj !== "object") {
      return obj as T;
    }

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        obj[i] = this.parse(obj[i]);
      }
      return obj as T;
    }

    const o = obj as Record<string, unknown>;

    if (Object.prototype.hasOwnProperty.call(o, "_T") && Object.prototype.hasOwnProperty.call(o, "V")) {
      return this.handleType(o["_T"] as number, o["V"]) as T;
    }

    if (Object.prototype.hasOwnProperty.call(o, "L")) {
      o["label"] = o["L"];
      delete o["L"];
    }

    if (Object.prototype.hasOwnProperty.call(o, "N")) {
      o["id"] = o["N"];
      delete o["N"];
    }

    for (const [key, value] of Object.entries(o)) {
      o[key] = this.parse(value);
    }

    return o as T;
  }

  static handleType(t: number, v: unknown): unknown {
    switch (t) {
      case 10: {
        if (typeof v !== "string") return v;
        if (v.trim() === "") return undefined;
        const r = Number(v.replaceAll(",", "."));
        return isNaN(r) ? v : r;
      }
      case 26:
      case 11:
      case 8:
        return NumberSet.parse(v as string);
      case 7:
        return DateParser.parse(v as string);
      // Colors, rich text (HTML) and URLs are kept as strings.
      case 4:
      case 21:
      case 23:
        return v;
      case 24:
      case 25:
      case 27:
        return this.parse(v);
      default:
        throw new ParsingError(t, v);
    }
  }
}
