import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import type { Address } from "@/types/internship";
import type { CompteResponse, DocumentsATelechargerResponse, HPDownloadableDocument } from "@/types/responses/account";
import { Tab } from "@/types/tabs";

const nonEmpty = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export type AccountInformation = {
  name?:           string;
  email?:          string;
  secondaryEmail?: string;
  /** Student national identifier. */
  ine?:            string;
  address:         Address;
  phone?:          string;
  mobile?:         string;
  website?:        string;
  photoAllowed:    boolean;
  smsAllowed:      boolean;
  raw:             CompteResponse;
};

export type PersonalDocument = {
  id:          string;
  label:       string;
  category?:   string;
  date?:       Date;
  /** Deadline for documents to provide. */
  deadline?:   Date;
  provided?:   boolean;
  attachments: Attachment[];
};

export type PersonalDocuments = {
  documents:   PersonalDocument[];
  /** Documents the student must provide. */
  toProvide:   PersonalDocument[];
  reportCards: PersonalDocument[];
  ects:        PersonalDocument[];
  toSign:      PersonalDocument[];
};

/** Personal information ("Informations personnelles"). Read-only by design. */
export class Account {
  public static async load(session: Session): Promise<AccountInformation> {
    const raw = await session.call<CompteResponse>("Compte", Tab.ACCOUNT);
    const phone = (prefix?: string, number?: string) => nonEmpty(number) && (nonEmpty(prefix) ? `+${prefix} ${number}` : number);

    return {
      name:           nonEmpty(raw.Nom),
      email:          nonEmpty(raw.Email),
      secondaryEmail: nonEmpty(raw.Email2),
      ine:            nonEmpty(raw.ine),
      address:        {
        lines:      [raw.Adresse1, raw.Adresse2, raw.Adresse3, raw.Adresse4].map(nonEmpty).filter((l): l is string => !!l),
        postalCode: nonEmpty(raw.CodePostal),
        city:       nonEmpty(raw.Ville?.label),
        province:   nonEmpty(raw.Province?.label),
        country:    nonEmpty(raw.Pays?.label)
      },
      phone:        phone(raw.IndicatifFixe, raw.TelFixe) || undefined,
      mobile:       phone(raw.IndicatifTel, raw.SMS) || undefined,
      website:      nonEmpty(raw.SiteInternet),
      photoAllowed: Boolean(raw.photoAutorisee),
      smsAllowed:   Boolean(raw.AutoriseSMS),
      raw
    };
  }

  public static async documents(session: Session): Promise<PersonalDocuments> {
    const raw = await session.call<DocumentsATelechargerResponse>("DocumentsATelecharger", Tab.DOCUMENTS);
    const map = (list?: HPDownloadableDocument[]) => (list ?? []).map((d) => ({
      id:          d.id,
      label:       d.label,
      category:    d.categorie?.label,
      date:        d.date,
      deadline:    d.dateLimiteDepot,
      provided:    d.estDepose,
      attachments: d.listePJ ? Attachment.list(session, d.listePJ) : [Attachment.create(session, d)]
    }));

    return {
      documents:   [...map(raw.listeDocuments), ...map(raw.listeDocumentsMembre)],
      toProvide:   map(raw.listeDocumentsAFournir),
      reportCards: map(raw.listeBulletins),
      ects:        map(raw.listeRecapECTS),
      toSign:      map(raw.listeDocumentsSignatureElecASigner)
    };
  }
}
