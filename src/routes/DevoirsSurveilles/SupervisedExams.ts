import type { Session } from "@/structures/Session";
import { GradingPeriods } from "@/routes/PeriodeNotation/GradingPeriods";
import type { GradingPeriod } from "@/types/grades";
import type { SupervisedExam } from "@/types/teaching";
import type { DevoirsSurveillesResponse } from "@/types/responses/teaching";
import { Tab } from "@/types/tabs";

/** Upcoming supervised exams ("Devoirs surveillés") of a grading period. */
export class SupervisedExams {
  public static async load(session: Session, period: GradingPeriod): Promise<SupervisedExam[]> {
    const raw = await session.call<DevoirsSurveillesResponse>(
      "DevoirsSurveilles",
      Tab.SUPERVISED_EXAMS,
      GradingPeriods.payload(period)
    );

    return (raw.listeProchainsDS ?? [])
      .map((ds) => ({
        id:       ds.id,
        date:     ds.date,
        subject:  ds.matiere?.label ?? ds.label,
        audience: (ds.listeRessources ?? []).map((r) => r.label)
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }
}
