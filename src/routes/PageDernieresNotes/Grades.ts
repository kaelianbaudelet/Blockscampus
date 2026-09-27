import type { Session } from "@/structures/Session";
import { GradeParser } from "@/structures/parsing/GradeParser";
import { GradingPeriods } from "@/routes/PeriodeNotation/GradingPeriods";
import type { GradeValue, GradingPeriod } from "@/types/grades";
import type { HPAssignment, PageDernieresNotesResponse } from "@/types/responses/grades";
import { Tab } from "@/types/tabs";
import { Grade } from "./Grade";
import { Subject } from "./Subject";

/** Latest grades ("Dernières notes") of a grading period. */
export class Grades {
  private _subjects?: Subject[];

  constructor(
    public readonly raw: PageDernieresNotesResponse,
    public readonly period: GradingPeriod,
    private readonly scale: number,
    private readonly session?: Session
  ) {}

  public static async load(session: Session, period: GradingPeriod, scale = 20): Promise<Grades> {
    const response = await session.call<PageDernieresNotesResponse>(
      "PageDernieresNotes",
      Tab.LATEST_GRADES,
      GradingPeriods.payload(period)
    );
    return new this(response, period, scale, session);
  }

  /** Message sent instead of grades (e.g. "Aucun devoir pour la période sélectionnée"). */
  public get message(): string | undefined { return this.raw.message }

  public get average(): GradeValue | undefined {
    const v = this.raw.moyenneGeneraleEtudiant;
    return v === undefined || v === "" ? undefined : GradeParser.parse(v, this.scale);
  }

  public get classAverage(): GradeValue | undefined {
    const v = this.raw.moyenneGeneralePromo;
    return v === undefined || v === "" ? undefined : GradeParser.parse(v, this.scale);
  }

  public get withGradeDetails(): boolean { return Boolean(this.raw.avecDetailsDevoir) }

  public get withSubjectDetails(): boolean { return Boolean(this.raw.avecDetailsService) }

  /** Every grade of the period, most recent first. */
  public get grades(): Grade[] {
    return this.subjects
      .flatMap((s) => s.grades)
      .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));
  }

  public get subjects(): Subject[] {
    if (this._subjects) return this._subjects;

    const byService = new Map<string, HPAssignment[]>();
    for (const assignment of this.raw.listeDevoirs ?? []) {
      const key = assignment.service?.id ?? "";
      (byService.get(key) ?? byService.set(key, []).get(key)!).push(assignment);
    }

    this._subjects = (this.raw.listeServices ?? []).map((service) => {
      const scale = service.baremeService ?? this.scale;
      const grades = (byService.get(service.id) ?? []).map((a) => new Grade(a, scale, this.session));
      return new Subject(service, grades, this.scale);
    });

    return this._subjects;
  }
}
