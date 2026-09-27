import type { ScheduleSettings } from "@/types/instance";
import type { HPTimeGrid } from "@/types/responses/user";

const DAY = 86_400_000;

/**
 * PRONOTE Campus never sends dates for courses: a course is located by a week number
 * (the "cycle", 1 being the week of `PremierLundi`) and a "place" inside that week
 * (`day index * placesPerDay + place of the day`). This class converts them back to dates.
 */
export class Schedule {
  constructor(
    public readonly settings: ScheduleSettings,
    public readonly grid: HPTimeGrid
  ) {}

  /** Week number (1-based) containing the given date. */
  public week(date: Date): number {
    const monday = this.settings.firstMonday;
    const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    const first = Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate());
    return Math.floor((day - first) / (7 * DAY)) + 1;
  }

  /** Weeks overlapping the given range, clamped to the school year. */
  public weeks(from: Date, to: Date): number[] {
    const first = Math.max(1, this.week(from));
    const last = Math.min(this.week(to), this.week(this.settings.lastDate));
    const weeks: number[] = [];
    for (let w = first; w <= last; w++) weeks.push(w);
    return weeks;
  }

  /** Monday of the given week. */
  public monday(week: number): Date {
    const m = this.settings.firstMonday;
    return new Date(m.getFullYear(), m.getMonth(), m.getDate() + (Math.max(1, week) - 1) * 7);
  }

  /** Date of the beginning (or the end when `end` is set) of a place of a week. */
  public placeToDate(week: number, place: number, end = false): Date {
    const { placesPerDay, openDays } = this.settings;
    const dayIndex = Math.floor(place / placesPerDay);
    const placeOfDay = place % placesPerDay;
    // `openDays` holds weekdays (1 = Monday); the day index points into that list.
    const weekday = openDays[dayIndex] ?? dayIndex + 1;
    const monday = this.monday(week);
    const [hours, minutes] = this.hour(placeOfDay, end);
    return new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + weekday - 1, hours, minutes);
  }

  /** Start of `start` and end of `start + duration - 1`. */
  public range(week: number, start: number, duration: number): { from: Date; to: Date } {
    return {
      from: this.placeToDate(week, start),
      to:   this.placeToDate(week, start + Math.max(1, duration) - 1, true)
    };
  }

  private hour(placeOfDay: number, end: boolean): [number, number] {
    const hours = this.grid.ListeHeures;
    const slot = hours[placeOfDay];
    const raw = end ? slot?.Fin ?? hours[placeOfDay + 1]?.Debut : slot?.Debut;

    if (raw) {
      const [h, m] = raw.split("h").map(Number);
      return [h ?? 0, m ?? 0];
    }

    // Fallback on the regular grid when the list of hours is incomplete.
    const first = hours[0]?.Debut?.split("h").map(Number) ?? [8, 0];
    const minutes = (first[0] ?? 8) * 60 + (first[1] ?? 0) + (placeOfDay + (end ? 1 : 0)) * (60 / this.settings.placesPerHour);
    return [Math.floor(minutes / 60), minutes % 60];
  }
}
