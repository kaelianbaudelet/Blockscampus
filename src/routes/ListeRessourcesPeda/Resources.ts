import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import type { PedagogicalResource } from "@/types/teaching";
import { HPResourceKind, type ListeRessourcesPedaResponse } from "@/types/responses/teaching";
import { Tab } from "@/types/tabs";

/** Pedagogical resources ("Ressources pédagogiques") shared by teachers. */
export class Resources {
  public static async load(session: Session): Promise<PedagogicalResource[]> {
    const raw = await session.call<ListeRessourcesPedaResponse>("ListeRessourcesPeda", Tab.RESOURCES, { avecURLs: false });

    return (raw.listeRessPeda ?? [])
      // Entries flagged as `estUnDeploiement` are subject headers.
      .filter((r) => !r.estUnDeploiement)
      .map((r) => {
        const kind = r.genreRessPeda ?? HPResourceKind.DOCUMENT;
        const isFile = kind !== HPResourceKind.WEBSITE && kind !== HPResourceKind.MCQ;
        return {
          id:         r.id,
          label:      r.label,
          kind,
          subject:    r.matiere ? { id: r.matiere.id, label: r.matiere.label } : undefined,
          date:       r.date,
          attachment: isFile ? Attachment.create(session, { id: r.id, label: r.strDocument ?? r.label }) : undefined,
          url:        r.url
        };
      });
  }
}
