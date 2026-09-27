import type { Session } from "@/structures/Session";
import { GradingPeriods } from "@/routes/PeriodeNotation/GradingPeriods";
import { Transcript } from "@/routes/PageReleveDeNotes/Transcript";
import type { GradingPeriod } from "@/types/grades";
import type { PageBulletinResponse } from "@/types/responses/grades";
import { Tab } from "@/types/tabs";

/**
 * Report card ("Bulletin") of a period.
 * It shares the layout of the transcript and adds teachers' appreciations.
 */
export class ReportCard extends Transcript {
  declare public readonly raw: PageBulletinResponse;

  public static override async load(
    session: Session,
    period: GradingPeriod,
    scale = 20,
    wholeCalendar = false
  ): Promise<ReportCard> {
    const response = await session.call<PageBulletinResponse>("PageBulletin", Tab.REPORT_CARD, {
      ...GradingPeriods.payload(period, wholeCalendar),
      etudiant: session.member ?? session.user
    });
    return new this(response, period, scale);
  }

  /** Appreciation of each subject, by subject id. */
  public get appreciations(): Map<string, string> {
    const map = new Map<string, string>();
    for (const service of this.raw.ListeServices ?? []) {
      const text = service.appreciation?.label?.trim();
      if (text) map.set(service.matiere?.id ?? service.id, text);
    }
    return map;
  }
}
