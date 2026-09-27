import type { HPElement } from "./common";

/** Answer of `FonctionParametres` (instance-wide settings, sent before authentication). */
export type FonctionParametresResponse = {
  identifiantNav?:   string;
  parametreGeneral:  HPGeneralSettings;
  parametres:        HPSpaceSettings;
  themeCouleur?:     number;
  /** Only set on demonstration instances. */
  dateDemo?:         Date;
  ChallengeBis?:     string;
  nomCookieAppli?:   string;
  aideContextuelle?: Record<string, unknown>;
};

export type HPGeneralSettings = {
  AvecEspaceMobile:                        boolean;
  UrlEspaceMobile?:                        string;
  urlLogo?:                                string;
  avecAuthentification:                    boolean;
  precisionNotation:                       number;
  baremeNotation:                          number;
  baremeMoyenneGeneraleAnnuelle?:          number;
  baremeMaxDevoirs:                        number;
  seuilNotation?:                          number;
  surplusBareme?:                          number;
  AvecGestionQCM:                          boolean;
  AvecGestionEtudiants:                    boolean;
  AvecGestionParents:                      boolean;
  AvecGestionStages:                       boolean;
  AvecGestionAlternances:                  boolean;
  afficherAbbreviationNiveauDAcquisition?: boolean;
  avecGestionEchelleNotation?:             boolean;
  accesSignatureNumerique?:                boolean;
  avecSmtpConfigure?:                      boolean;
  avecForum:                               boolean;
  AvecAide?:                               boolean;
  UrlAide?:                                string;
  urlSiteIndexEducation?:                  string;
  urlInfosHebergement?:                    string;
  accessibiliteNonConforme?:               boolean;
  urlDeclarationAccessibilite?:            string;
  urlPolitiqueConfidentialite?:            string;
  UrlVersion?:                             string;
  urlFAQEnregistrementDoubleAuth?:         string;
  urlTutoVideoSecurite?:                   string;
  urlTutoEnregistrerAppareils?:            string;
  /** e.g. "PRONOTE Campus 2026.4.7.2" */
  Version:                                 string;
  millesime:                               string;
  /** Current day on the server. */
  Jour:                                    Date;
  /** Place value used for courses without a position in the grid. */
  NonPlace:                                number;
  AvecSite?:                               boolean;
  AvecFamilleDeSalle?:                     boolean;
  /** Monday of the first week (week/cycle 1). */
  PremierLundi:                            Date;
  DerniereDate:                            Date;
  /** Working days, 1 = Monday. */
  JoursOuvres:                             number[];
  PeriodeCloturee?:                        number[];
  NombreJoursOuvres:                       number;
  SemainesFeriees?:                        number[];
  JoursFeries?:                            number[];
  PlacesParHeure:                          number;
  PlacesParJour:                           number;
  /** Duration of a sequence, in days. */
  DureeSequence:                           number;
  DebPauseDejeune?:                        number;
  FinPauseDejeune?:                        number;
  RessourcesAvecDP?:                       number[];
  AvecGestionPhotos?:                      boolean;
  nombreContenusMax?:                      number;
  minBaremeQuestionQCM?:                   number;
  maxBaremeQuestionQCM?:                   number;
  maxNbPointQCM?:                          number;
  maxNiveauQCM?:                           number;
  AvecRecuperationInfosConnexion?:         boolean;
  estHebergeEnFrance?:                     boolean;
  listeAnnotationsAutorisees?:             number[];
  langue:                                  string;
  langID:                                  number;
  listeLangues:                            { langID: number; description: string }[];
  ListeSalles?:                            HPElement[];
};

export type HPSpaceSettings = {
  Divers?:          Array<{ G: number; NomEtablissement?: string; BloquerReferencementEspacesDansMoteurRecherche?: boolean }>;
  Espace?:          Array<Record<string, unknown> & { G: number; EnteteNom?: string }>;
  MentionsLegales?: Array<Record<string, unknown> & { G: number }>;
  Personnel?:       Array<Record<string, unknown> & { G: number }>;
  PlanningGeneral?: Array<{ G: number; NumeroPremiereSemaine?: number }>;
  Ressource?:       Array<Record<string, unknown> & { G: number }>;
};
