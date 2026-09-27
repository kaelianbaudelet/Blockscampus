import type { Session } from "@/structures/Session";
import type { HPDocument } from "@/types/responses/common";

/** `TypeFichierExterneHttpHP` */
export type AttachmentKind = "DevoirSujet" | "DevoirCorrige";

/** A file hosted by PRONOTE Campus, downloadable while the session is alive. */
export class Attachment {
  constructor(
    public name: string,
    public url: URL
  ) {}

  /**
   * Files are served at `FichiersExternes/<AES(JSON({ N, G? }))>/<name>?Session=<id>`,
   * `G` being the kind of file (e.g. `DevoirSujet`) when it is not a plain document.
   */
  public static create(session: Session, document: HPDocument, kind?: AttachmentKind, prefix = "FichiersExternes"): Attachment {
    const encrypted = session.aes.encrypt(JSON.stringify(kind ? { N: document.id, G: kind } : { N: document.id }));
    const url = new URL(
      [session.source.replace(/\/$/, ""), prefix, encrypted, encodeURIComponent(document.label)].join("/")
    );
    url.searchParams.set("Session", session.id);
    return new Attachment(document.label, url);
  }

  public static list(session: Session, documents?: HPDocument[]): Attachment[] {
    return (documents ?? []).map((d) => Attachment.create(session, d));
  }
}
