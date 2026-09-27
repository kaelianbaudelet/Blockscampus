import type { Schedule } from "@/structures/Schedule";
import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import { Parser } from "@/structures/parsing/Parser";
import type { Absence, Lateness, Reason } from "@/types/schoollife";
import type { HPAbsence, HPLateness, HPReason, PageReleveAbsenceResponse } from "@/types/responses/schoollife";
import { Tab } from "@/types/tabs";

const HOURS_PER_DAY = 24;

/** Absences and lateness ("Relevé d'absences et retards"). */
export class Absences {
  constructor(
    public readonly raw: PageReleveAbsenceResponse,
    private readonly schedule: Schedule,
    private readonly session: Session
  ) {}

  public static async load(session: Session, schedule: Schedule, from: Date, to: Date): Promise<Absences> {
    const response = await session.call<PageReleveAbsenceResponse>("PageReleveAbsence", Tab.ABSENCES, {
      eleve:      session.member ?? session.user,
      dateDebut:  Parser.encodeDate(from),
      dateFin:    Parser.encodeDate(to),
      justifie:   true,
      injustifie: true,
      uniqOblig:  false
    });
    return new this(response, schedule, session);
  }

  private reason(raw?: HPReason): Reason | undefined {
    if (!raw?.id || raw.id === "0") return undefined;
    return { id: raw.id, label: raw.label, justified: Boolean(raw.EstJustifie), color: raw.Couleur };
  }

  public get absences(): Absence[] {
    return (this.raw.ListeAbsences ?? []).map((a) => this.absence(a));
  }

  public get lateness(): Lateness[] {
    return (this.raw.listeRetards ?? []).map((l) => this.late(l));
  }

  /** Reasons that can be used to justify an absence. */
  public get absenceReasons(): Reason[] {
    return (this.raw.listeMotifsAbsences ?? []).map((r) => this.reason(r)).filter((r): r is Reason => !!r);
  }

  public get latenessReasons(): Reason[] {
    return (this.raw.listeMotifsRetards ?? []).map((r) => this.reason(r)).filter((r): r is Reason => !!r);
  }

  private absence(raw: HPAbsence): Absence {
    return {
      id:            raw.id,
      from:          this.schedule.placeToDate(raw.SD, raw.PD),
      to:            this.schedule.placeToDate(raw.SF, raw.PF, true),
      justified:     Boolean(raw.MotifAbsence?.EstJustifie ?? raw.R),
      reason:        this.reason(raw.MotifAbsence),
      justification: raw.details?.justification || undefined,
      documents:     Attachment.list(this.session, raw.details?.documents),
      subjects:      (raw.ListeMatieres ?? []).map((s) => ({
        label:            s.label,
        missedHours:      (s.enDuree?.DACoursP ?? 0) * HOURS_PER_DAY,
        justifiedHours:   (s.enDuree?.DAJCoursP ?? 0) * HOURS_PER_DAY,
        unjustifiedHours: (s.enDuree?.DAICoursP ?? 0) * HOURS_PER_DAY,
        plannedHours:     (s.enDuree?.DCoursPrevusP ?? 0) * HOURS_PER_DAY,
        missedLessons:    s.enNombre?.DACoursP ?? 0,
        plannedLessons:   s.enNombre?.DCoursPrevusP ?? 0
      }))
    };
  }

  private late(raw: HPLateness): Lateness {
    return {
      id:            raw.id,
      date:          raw.date,
      duration:      Math.round(raw.duree * HOURS_PER_DAY * 60),
      justified:     Boolean(raw.motifRetard?.EstJustifie ?? raw.estElementVSJustifie),
      reason:        this.reason(raw.motifRetard),
      subject:       raw.matiere?.label,
      justification: raw.details?.justification || undefined
    };
  }
}
