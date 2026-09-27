import type { Session } from "@/structures/Session";
import type { GradingPeriod } from "@/types/grades";
import type { HPRawElement } from "@/types/responses/common";
import { HPPeriodKind, type HPGradingPeriod, type PeriodeNotationResponse } from "@/types/responses/grades";
import { Tab } from "@/types/tabs";

export class GradingPeriods {
  public static async load(session: Session, tab: string = Tab.LATEST_GRADES): Promise<GradingPeriod[]> {
    const response = await session.call<PeriodeNotationResponse>("PeriodeNotation", tab);
    const current = response.periodeCourante?.id;
    return (response.listePeriodes ?? []).map((p) => GradingPeriods.parse(p, current));
  }

  private static parse(raw: HPGradingPeriod, current?: string): GradingPeriod {
    const calendar = raw.calendrier && raw.calendrier.id !== "0"
      ? { id: raw.calendrier.id, label: raw.calendrier.label }
      : undefined;

    return {
      id:           raw.id,
      label:        raw.label,
      kind:         HPPeriodKind.PERIOD,
      abbreviation: raw.abbr || undefined,
      color:        raw.couleur,
      from:         raw.dates?.debut,
      to:           raw.dates?.fin,
      calendar,
      promotion:    raw.publique ? { id: raw.publique.id, label: raw.publique.label, kind: raw.publique.G } : undefined,
      current:      raw.id === current
    };
  }

  /** Current period, or the one containing today, or the first one. */
  public static current(periods: GradingPeriod[], date = new Date()): GradingPeriod | undefined {
    return periods.find((p) => p.current)
      ?? periods.find((p) => p.from && p.to && p.from <= date && date <= p.to)
      ?? periods[0];
  }

  /** Payload keys shared by grades requests: the promotion and the period (or calendar). */
  public static payload(period: GradingPeriod, wholeCalendar = false): Record<string, HPRawElement | undefined> {
    const ressource = period.promotion
      ? { N: period.promotion.id, G: period.promotion.kind, L: period.promotion.label }
      : undefined;

    if (wholeCalendar && period.calendar) {
      return { ressource, calendrier: { N: period.calendar.id, G: HPPeriodKind.CALENDAR, L: period.calendar.label } };
    }

    return { ressource, periode: { N: period.id, G: period.kind, L: period.label } };
  }
}
