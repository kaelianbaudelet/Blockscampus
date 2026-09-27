import { randomBytes } from "@noble/hashes/utils.js";
import type {
  FeatureSettings,
  GradingSettings,
  Language,
  LinksSettings,
  ScheduleSettings,
  SchoolInfo
} from "@/types/instance";
import type { Session } from "@/structures/Session";
import { RSA } from "@/structures/crypto/RSA";
import type { FonctionParametresResponse } from "@/types/responses/instance";

/** Instance-wide settings returned by `FonctionParametres`. */
export class Settings {
  constructor(
    public productName: string,
    public version: string,
    public isDemo: boolean,
    public school: SchoolInfo,
    public schoolYear: number,
    public serverDate: Date,
    public grading: GradingSettings,
    public availableLanguages: Language[],
    public currentLanguage: Language,
    public schedule: ScheduleSettings,
    public features: FeatureSettings,
    public links: LinksSettings,
    public raw: FonctionParametresResponse
  ) {}

  public static async load(session: Session): Promise<Settings> {
    const nextIv = randomBytes(16);
    const uuid = session.useHttps ? Buffer.from(nextIv).toString("base64") : RSA.encrypt1024(nextIv);

    const response = await session.call<FonctionParametresResponse>("FonctionParametres", undefined, {
      Uuid:           uuid,
      identifiantNav: null
    });
    session.aes.updateIv(nextIv);

    return Settings.fromResponse(session, response);
  }

  public static fromResponse(session: Session, response: FonctionParametresResponse): Settings {
    const g = response.parametreGeneral;
    const languages: Language[] = g.listeLangues.map((l) => ({ id: l.langID, label: l.description }));
    const currentLanguage = languages.find((l) => l.id === g.langID) ?? languages[0] ?? { id: g.langID, label: g.langue };
    const version = g.Version.replace(/^\D+/, "");
    const schoolName = response.parametres.Divers?.find((d) => d.NomEtablissement)?.NomEtablissement ?? "";
    const absolute = (path?: string) => (path ? new URL(path, session.source).toString() : undefined);

    return new Settings(
      g.Version.replace(version, "").trim(),
      version,
      response.dateDemo !== undefined,
      { name: schoolName, logoUrl: absolute(g.urlLogo) },
      Number(g.millesime),
      g.Jour,
      {
        scale:     g.baremeNotation,
        maxGrade:  g.baremeMaxDevoirs,
        decimals:  Math.log10(g.precisionNotation || 1),
        threshold: g.seuilNotation
      },
      languages,
      currentLanguage,
      {
        firstMonday:   g.PremierLundi,
        lastDate:      g.DerniereDate,
        openDays:      g.JoursOuvres,
        placesPerDay:  g.PlacesParJour,
        placesPerHour: g.PlacesParHeure,
        unplaced:      g.NonPlace
      },
      {
        mcq:         g.AvecGestionQCM,
        students:    g.AvecGestionEtudiants,
        parents:     g.AvecGestionParents,
        internships: g.AvecGestionStages,
        workStudy:   g.AvecGestionAlternances,
        forum:       g.avecForum
      },
      {
        help:                     g.UrlAide,
        indexEducationWebsite:    g.urlSiteIndexEducation,
        hostingInfo:              g.urlInfosHebergement,
        privacyPolicy:            g.urlPolitiqueConfidentialite,
        faqTwoFactorRegistration: g.urlFAQEnregistrementDoubleAuth,
        securityTutorialVideo:    g.urlTutoVideoSecurite,
        registerDevicesTutorial:  g.urlTutoEnregistrerAppareils,
        accessibilityDeclaration: absolute(g.urlDeclarationAccessibilite)
      },
      response
    );
  }
}
