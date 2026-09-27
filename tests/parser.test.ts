import { describe, expect, test } from "bun:test";
import { Parser } from "@/structures/parsing/Parser";
import { NumberSet } from "@/structures/parsing/NumberSet";
import { DateParser } from "@/structures/parsing/DateParser";

describe("Parser", () => {
  test("renames L/N and unwraps typed values", () => {
    const parsed = Parser.parse<Record<string, unknown>>({
      L:     "Salle C",
      N:     "50#abc",
      G:     3,
      note:  { _T: 10, V: "11,28" },
      vide:  { _T: 10, V: "" },
      dom:   { _T: 8, V: "[1..3,7]" },
      date:  { _T: 7, V: "13/09/2026" },
      html:  { _T: 21, V: "<b>x</b>" },
      color: { _T: 4, V: "#C8AE71" },
      list:  { _T: 24, V: [{ L: "A", N: "1#a" }] }
    });

    expect(parsed).toEqual({
      label: "Salle C",
      id:    "50#abc",
      G:     3,
      note:  11.28,
      vide:  undefined,
      dom:   [1, 2, 3, 7],
      date:  new Date(2026, 8, 13),
      html:  "<b>x</b>",
      color: "#C8AE71",
      list:  [{ label: "A", id: "1#a" }]
    });
  });

  test("keeps annotations of grades as strings", () => {
    expect(Parser.handleType(10, "|1")).toBe("|1");
  });
});

describe("NumberSet", () => {
  test("round-trips compact sets", () => {
    expect(NumberSet.encode([7, 1, 2, 3, 5])).toBe("[1..3,5,7]");
    expect(NumberSet.parse(NumberSet.encode([4]))).toEqual([4]);
    expect(NumberSet.encode([])).toBe("[]");
  });
});

describe("DateParser", () => {
  test("encodes days as dd/mm/yyyy", () => {
    expect(DateParser.encodeDay(new Date(2026, 8, 3))).toBe("03/09/2026");
  });
});
