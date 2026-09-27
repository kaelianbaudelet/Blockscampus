import type { Session } from "@/structures/Session";
import type { SchoolingHistory } from "@/types/schoollife";
import type { PageScolariteResponse } from "@/types/responses/schoollife";
import { Tab } from "@/types/tabs";

/** Current and past promotions of the student ("Scolarité"). */
export class Schooling {
  public static async load(session: Session): Promise<SchoolingHistory> {
    const raw = await session.call<PageScolariteResponse>("PageScolarite", Tab.SCHOOLING);
    return {
      current: (raw.listeRessourcesActuelles ?? []).map((r) => ({ id: r.id, label: r.label })),
      history: (raw.listeRessourcesHistoriques ?? []).map((r) => ({
        id:      r.id,
        label:   r.label,
        periods: (r.dates ?? []).map((d) => ({ from: d.dateDebut, to: d.dateFin }))
      }))
    };
  }
}
