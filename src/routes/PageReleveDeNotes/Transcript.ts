import type { Session } from "@/structures/Session";
import { GradeParser } from "@/structures/parsing/GradeParser";
import { GradingPeriods } from "@/routes/PeriodeNotation/GradingPeriods";
import type { GradingPeriod, TranscriptSubject } from "@/types/grades";
import type { HPGradeValue, HPTranscriptService, PageReleveDeNotesResponse } from "@/types/responses/grades";
import type { HPRawElement } from "@/types/responses/common";
import { Tab } from "@/types/tabs";

/** Grade transcript ("Relevé de notes") of a period. */
export class Transcript {
  constructor(
    public readonly raw: PageReleveDeNotesResponse,
    public readonly period: GradingPeriod,
    private readonly scale: number
  ) {}

  public static async load(
    session: Session,
    period: GradingPeriod,
    scale = 20,
    wholeCalendar = false
  ): Promise<Transcript> {
    const response = await session.call<PageReleveDeNotesResponse>("PageReleveDeNotes", Tab.TRANSCRIPT, {
      ...GradingPeriods.payload(period, wholeCalendar),
      etudiant: session.member ?? session.user
    } satisfies Record<string, HPRawElement | undefined>);
    return new this(response, period, scale);
  }

  /** Set when the transcript is not published (e.g. "Le relevé de notes sera publié à partir du ..."). */
  public get message(): string | undefined { return this.raw.message }

  public get published(): boolean { return !this.raw.message }

  /** Summary of absences, e.g. "Absences : 6h00 injustifiées parmi 10h00 au total". */
  public get absences(): string | undefined { return this.raw.pied?.strAbsences }

  public get modules(): Array<{ id: string; label: string; coefficient: number }> {
    return (this.raw.listeModules ?? []).map((m) => ({ id: m.id, label: m.label, coefficient: m.coefficient ?? 1 }));
  }

  public get subjects(): TranscriptSubject[] {
    return (this.raw.ListeServices ?? []).map((s) => this.subject(s));
  }

  private value(value: HPGradeValue | undefined, scale: number) {
    return value === undefined || value === "" ? undefined : GradeParser.parse(value, scale);
  }

  private subject(raw: HPTranscriptService): TranscriptSubject {
    const scale = raw.baremeService ?? this.scale;
    return {
      id:          raw.matiere?.id ?? raw.id,
      label:       raw.matiere?.label ?? raw.label ?? "",
      color:       raw.matiere?.couleur,
      module:      raw.module?.id && raw.module.id !== "0" ? raw.module.label : undefined,
      coefficient: raw.coefficient ?? 1,
      teachers:    (raw.listeProfesseurs ?? []).map((t) => t.label),
      assignments: (raw.listeDevoirs ?? []).map((a) => ({
        id:          a.id,
        value:       this.value(a.note, a.bareme ?? scale),
        coefficient: a.coefficient ?? 1,
        comment:     a.commentaire?.trim() || undefined,
        isBonus:     Boolean(a.commeUnBonus),
        isOptional:  Boolean(a.commeUneNote || a.commeUnSeuil),
        kind:        a.genreNotation?.label,
        periods:     (a.listePeriodesNotation ?? []).map((p) => p.label)
      })),
      averages: (raw.listeGenreNotation ?? []).map((k) => ({
        kind:         k.label,
        abbreviation: k.abbr,
        coefficient:  k.coefficient ?? 1,
        value:        this.value(k.moyenneEleve, scale)
      }))
    };
  }
}
