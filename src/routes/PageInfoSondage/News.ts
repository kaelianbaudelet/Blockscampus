import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import type { CentraleNotificationsResponse, HPNews, PageInfoSondageResponse } from "@/types/responses/communication";
import { Tab } from "@/types/tabs";

export type NewsItem = {
  id:        string;
  title:     string;
  /** Information, or survey expecting answers. */
  kind:      "information" | "survey";
  from?:     Date;
  to?:       Date;
  read:      boolean;
  author?:   string;
  anonymous: boolean;
  questions: Array<{ title?: string; content?: string; choices: string[]; attachments: Attachment[] }>;
  raw:       HPNews;
};

export type Notification = {
  id:    string;
  label: string;
  date?: Date;
  read:  boolean;
};

/** Information and surveys ("Informations et sondages"). */
export class News {
  public static async load(session: Session): Promise<NewsItem[]> {
    const raw = await session.call<PageInfoSondageResponse>("PageInfoSondage", Tab.NEWS, { avecAuteur: false });
    const unique = new Map<string, HPNews>();
    for (const mode of raw.listeModesAff ?? []) {
      for (const item of mode.listeActualites ?? []) unique.set(item.id, item);
    }

    return [...unique.values()].map((n) => ({
      id:        n.id,
      title:     n.label,
      kind:      n.estInformation === false ? "survey" : "information",
      from:      n.dateDebut,
      to:        n.dateFin,
      read:      Boolean(n.lue),
      author:    n.elmAuteur?.label ?? n.auteur,
      anonymous: Boolean(n.reponseAnonyme),
      questions: (n.listeQuestions ?? []).map((q) => ({
        title:       q.titre ?? q.label,
        content:     q.texte,
        choices:     (q.listeChoix ?? []).map((c) => c.label),
        attachments: Attachment.list(session, q.listePiecesJointes)
      })),
      raw: n
    }));
  }

  /** Notifications of the notification center. */
  public static async notifications(session: Session): Promise<Notification[]> {
    const raw = await session.call<CentraleNotificationsResponse>("CentraleNotifications", Tab.HOME);
    return (raw.liste ?? []).map((n) => ({ id: n.id, label: n.label ?? n.message ?? "", date: n.date, read: Boolean(n.lue) }));
  }
}
