import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import type { HostCompany, Internship, InternshipSummary } from "@/types/internship";
import type {
  FicheStageResponse,
  HPCompany,
  ListeOffresStagesResponse,
  ListeStagesResponse
} from "@/types/responses/internship";
import { Tab } from "@/types/tabs";

const nonEmpty = (v?: string) => (v && v.trim() ? v.trim() : undefined);

/** Internships and companies ("En entreprise"). */
export class Internships {
  /** Internships (and work-study contracts) of the student. */
  public static async list(session: Session): Promise<InternshipSummary[]> {
    const raw = await session.call<ListeStagesResponse>("ListeStages", Tab.INTERNSHIP);
    return (raw.listeStages ?? []).map((s) => ({ id: s.id, label: s.label }));
  }

  /** Detailed sheet ("Fiche de stage") of an internship. */
  public static async get(session: Session, internship: InternshipSummary): Promise<Internship | undefined> {
    const raw = await session.call<FicheStageResponse>("FicheStage", Tab.INTERNSHIP, {
      stage: { N: internship.id, L: internship.label }
    });
    const s = raw.ficheStage;
    if (!s) return undefined;

    return {
      id:              s.id,
      label:           s.label,
      dates:           s.libelleDates,
      workStudy:       Boolean(s.estAlternance),
      contract:        { from: s.dateDebutContrat, to: s.dateFinContrat, type: s.typeContrat },
      duration:        s.dureeStage,
      description:     nonEmpty(s.sujetDetaille),
      agreementSigned: Boolean(s.conventionSignee),
      goals:           nonEmpty(s.objectifs),
      activities:      nonEmpty(s.activitesPrevues),
      skills:          nonEmpty(s.competencesVisees),
      tutor:           s.enseignantTuteur?.label,
      referent:        s.enseignantResponsable?.label,
      company:         s.entreprise ? Internships.company(session, s.entreprise) : undefined,
      supervisors:     (s.maitresDeStage ?? []).map((m) => ({ name: m.label, role: nonEmpty(m.fonction) })),
      schedule:        (s.jours ?? []).map((d) => ({ day: d.label, hours: (d.horaires ?? []).map((h) => h.label) })),
      weeklyHours:     s.dureeHebdomadaire !== undefined ? s.dureeHebdomadaire * 24 : undefined,
      weeks:           s.nbSemaines,
      days:            s.nbJours,
      attachments:     Attachment.list(session, s.piecesjointes)
    };
  }

  /** Companies and their internship offers ("Liste des entreprises"). */
  public static async companies(session: Session): Promise<HostCompany[]> {
    const raw = await session.call<ListeOffresStagesResponse>("ListeOffresStages", Tab.COMPANIES);
    return (raw.listeEntreprises ?? []).map((c) => Internships.company(session, c));
  }

  private static company(session: Session, c: HPCompany): HostCompany {
    return {
      id:         c.id,
      name:       c.label,
      tradeName:  nonEmpty(c.nomCommercial),
      siret:      nonEmpty(c.siret),
      headOffice: Boolean(c.estSiegeSocial),
      address:    {
        lines:      [c.adresse1, c.adresse2, c.adresse3, c.adresse4].map(nonEmpty).filter((l): l is string => !!l),
        postalCode: nonEmpty(c.codePostal),
        city:       nonEmpty(c.ville),
        province:   nonEmpty(c.province),
        country:    nonEmpty(c.pays)
      },
      phone:     nonEmpty(c.numeroFixe ?? c.telephoneFixe),
      mobile:    nonEmpty(c.numeroMobile ?? c.portable),
      email:     nonEmpty(c.email),
      website:   nonEmpty(c.siteInternet),
      activity:  c.activite?.label,
      comment:   nonEmpty(c.commentairePublie),
      manager:   c.responsable ? { name: c.responsable.label, role: nonEmpty(c.responsable.fonction) } : undefined,
      documents: Attachment.list(session, c.documents),
      offers:    (c.listeOffresStages ?? []).map((o) => ({
        id:             o.id,
        subject:        o.sujet?.label,
        description:    nonEmpty(o.sujetDetaille),
        comment:        nonEmpty(o.commentaire),
        duration:       nonEmpty(o.duree),
        durationInDays: o.dureeEnJours,
        publishedAt:    o.date,
        positions:      o.nbPropose ?? 0,
        filled:         o.nbPourvus ?? 0,
        attachments:    Attachment.list(session, o.piecesjointes)
      }))
    };
  }
}
