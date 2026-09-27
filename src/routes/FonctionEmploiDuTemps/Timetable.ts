import type { TimetableDay, TimetableOptions } from "@/types/timetable";
import type { FonctionEmploiDuTempsResponse } from "@/types/responses/timetable";
import type { Schedule } from "@/structures/Schedule";
import type { Session } from "@/structures/Session";
import { Parser } from "@/structures/parsing/Parser";
import { Lesson } from "@/routes/FonctionEmploiDuTemps/Lesson";
import { Tab } from "@/types/tabs";

/** `EGenreAffichageEDT.EnListe`: one entry per occurrence of a course. */
const DISPLAY_LIST = 1;
/** `EGenrePeriodeEDT.Domaine`: the period is a set of weeks. */
const PERIOD_WEEKS = 2;
/** `TypeParametreCoursAAfficherRessourceLiee.carl_CoursAnnule`. */
const FILTER_CANCELED = 7;

export class Timetable {
  private _lessons?: Lesson[];

  private _days?: TimetableDay[];

  constructor(
    protected readonly schedule: Schedule,
    public readonly raw: FonctionEmploiDuTempsResponse,
    protected readonly options: Required<Pick<TimetableOptions, "from" | "to">> & TimetableOptions
  ) {}

  /** Payload shared by `FonctionEmploiDuTemps` and `Progressions`. */
  public static payload(weeks: number[], options: { ignoreCanceled?: boolean; withRanges?: boolean } = {}) {
    return {
      GenrePeriodeEDT:      PERIOD_WEEKS,
      GenreAffichageEDT:    DISPLAY_LIST,
      FiltreRessources:     Parser.encodeSet(26, [FILTER_CANCELED]),
      AvecIndisponibilites: false,
      AvecDomaineCours:     true,
      AvecDomainePere:      false,
      filterPlagesHoraires: options.withRanges ?? false,
      ignorerCoursAnnules:  options.ignoreCanceled ?? false,
      avecInfosAppel:       false,
      Domaine:              Parser.encodeSet(8, weeks)
    };
  }

  public static async load(
    session: Session,
    schedule: Schedule,
    options: Required<Pick<TimetableOptions, "from" | "to">> & TimetableOptions,
    tab: string = Tab.TIMETABLE
  ): Promise<Timetable> {
    const weeks = schedule.weeks(options.from, options.to);
    const raw = weeks.length === 0
      ? {}
      : await session.call<FonctionEmploiDuTempsResponse>(
        "FonctionEmploiDuTemps",
        tab,
        this.payload(weeks, { ignoreCanceled: options.ignoreCanceled })
      );

    return new this(schedule, raw, options);
  }

  public get lessons(): readonly Lesson[] {
    if (!this._lessons) {
      const { from, to } = this.options;
      const lessons = [
        ...(this.raw.ListeCours ?? []).map((c) => new Lesson(c, this.schedule)),
        ...(this.options.ignoreCanceled ? [] : this.raw.ListeAnnulationsCours ?? []).map((c) => new Lesson(c, this.schedule, true))
      ];

      this._lessons = lessons
        .filter((l) => l.to > from && l.from < to)
        .sort((a, b) => a.from.getTime() - b.from.getTime());
    }
    return this._lessons;
  }

  public get days(): readonly TimetableDay[] {
    if (!this._days) {
      const byDay = new Map<number, Lesson[]>();
      for (const lesson of this.lessons) {
        const d = lesson.from;
        const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        (byDay.get(key) ?? byDay.set(key, []).get(key)!).push(lesson);
      }

      this._days = [...byDay.entries()]
        .sort(([a], [b]) => a - b)
        .map(([t, lessons]) => ({ date: new Date(t), lessons }));
    }
    return this._days;
  }
}
