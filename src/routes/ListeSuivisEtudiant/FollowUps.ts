import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import type { FollowUp } from "@/types/schoollife";
import type { ListeSuivisEtudiantResponse } from "@/types/responses/schoollife";
import { Tab } from "@/types/tabs";

/** Follow-ups of the student ("Suivis"): meetings, company visits... */
export class FollowUps {
  public static async load(session: Session, tab: string = Tab.FOLLOW_UPS): Promise<FollowUp[]> {
    const raw = await session.call<ListeSuivisEtudiantResponse>("ListeSuivisEtudiant", tab, {
      eleve: session.member ?? session.user
    });

    return (raw.listeSuivis ?? []).map((s) => ({
      id:          s.id,
      label:       s.label,
      date:        s.date,
      withTime:    Boolean(s.avecHeure),
      author:      s.auteur?.label,
      category:    s.categorie ? { label: s.categorie.label, color: s.categorie.couleur } : undefined,
      internship:  s.stage?.label,
      comment:     s.commentaire || undefined,
      attachments: Attachment.list(session, s.listePiecesJointes)
    }));
  }
}
