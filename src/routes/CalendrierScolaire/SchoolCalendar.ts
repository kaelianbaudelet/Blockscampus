import type { Session } from "@/structures/Session";
import type { SchoolCalendarData } from "@/types/schoollife";
import type { CalendrierScolaireResponse } from "@/types/responses/schoollife";
import type { HPDateInterval } from "@/types/responses/common";
import { Tab } from "@/types/tabs";

const interval = (i: HPDateInterval) => ({ from: i.dateDebut, to: i.dateFin });

/** School calendar ("Calendrier scolaire"): teaching periods, internships and attendance days. */
export class SchoolCalendar {
  public static async load(session: Session): Promise<SchoolCalendarData> {
    const raw = await session.call<CalendrierScolaireResponse>("CalendrierScolaire", Tab.SCHOOL_CALENDAR);

    return {
      label:   raw.calendrier?.label,
      periods: (raw.calendrier?.listePeriodes ?? []).map((p) => ({
        id:        p.id,
        label:     p.label,
        weeks:     p.domaine ?? [],
        intervals: (p.listeIntervalles ?? []).map(interval),
        isExam:    Boolean(p.estExamen),
        color:     p.couleur
      })),
      internships: (raw.listeStages ?? []).map((s) => ({
        id:        s.id,
        label:     s.label,
        workStudy: Boolean(s.estAlternance),
        intervals: (s.listeIntervalles ?? []).map(interval)
      })),
      attendance: (raw.listeJourPresence ?? []).map(interval)
    };
  }
}
