import { describe, expect, test } from "bun:test";
import { demoSchedule } from "./helpers";

describe("Schedule (demo: first Monday 31/08/2026, 20 places a day from 08h00)", () => {
  const schedule = demoSchedule();

  test("computes week numbers", () => {
    expect(schedule.week(new Date(2026, 7, 31))).toBe(1);
    expect(schedule.week(new Date(2026, 8, 6))).toBe(1);
    expect(schedule.week(new Date(2026, 8, 22))).toBe(4);
    expect(schedule.weeks(new Date(2026, 8, 21), new Date(2026, 8, 28))).toEqual([4, 5]);
  });

  test("converts places to dates", () => {
    // p = 35 in week 4: Tuesday (35 / 20 = 1), place 15 → 15h30, displayed as "15h30 - 17h30".
    const { from, to } = schedule.range(4, 35, 4);
    expect(from).toEqual(new Date(2026, 8, 22, 15, 30));
    expect(to).toEqual(new Date(2026, 8, 22, 17, 30));
  });

  test("converts absences bounds (end of the last place)", () => {
    expect(schedule.placeToDate(1, 60)).toEqual(new Date(2026, 8, 3, 8, 0));
    expect(schedule.placeToDate(1, 69, true)).toEqual(new Date(2026, 8, 3, 13, 0));
  });
});
