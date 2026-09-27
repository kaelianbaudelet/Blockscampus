import type { HPElement, HPReference } from "./common";

/** `EGenreCalendrierPeriodeNotation` */
export const HPPeriodKind = {
  CALENDAR: 1,
  PERIOD:   2,
  PUBLIC:   3
} as const;

export type HPGradingPeriod = HPElement & {
  calendrier?: Partial<HPElement> & { id: string };
  /** Promotion the period belongs to. */
  publique?:   HPElement;
  couleur?:    string;
  abbr?:       string;
  dates?:      { debut: Date; fin: Date };
  importe?:    boolean;
};

/** Answer of `PeriodeNotation`. */
export type PeriodeNotationResponse = {
  listePeriodes?:   HPGradingPeriod[];
  periodeCourante?: HPElement;
  message?:         string;
};

/** Grade values are numbers, or strings for annotations (e.g. `"|1"` for absent). */
export type HPGradeValue = number | string;

export type HPSubject = HPElement & {
  G?:               number;
  couleur?:         string;
  moyenneEtudiant?: HPGradeValue;
  moyenneClasse?:   HPGradeValue;
  moyenneMin?:      HPGradeValue;
  moyenneMax?:      HPGradeValue;
  nbNotesEleve?:    number;
  libelleInt?:      string;
};

export type HPService = {
  id:                          string;
  G?:                          number;
  label?:                      string;
  baremeService?:              number;
  matiere?:                    HPSubject;
  avecDetailDevoirsNonPublie?: boolean;
};

export type HPAssignment = {
  id:                  string;
  G?:                  number;
  label?:              string;
  note?:               HPGradeValue;
  bareme?:             number;
  coefficient?:        number;
  /** Average of the promotion. */
  moyenne?:            HPGradeValue;
  noteMin?:            HPGradeValue;
  noteMax?:            HPGradeValue;
  genrePublic?:        number;
  service?:            HPReference;
  date?:               Date;
  commentaire?:        string;
  estRamenerSur20?:    boolean;
  estFacultatifBonus?: boolean;
  estFacultatifNote?:  boolean;
  estFacultatifSeuil?: boolean;
  estDS?:              boolean;
  libelleSujet?:       string;
  libelleCorrige?:     string;
  devoirRattrapage?:   HPAssignment & { genreRattrapage?: number };
};

/** Answer of `PageDernieresNotes`. */
export type PageDernieresNotesResponse = {
  message?:                 string;
  avecDetailsService?:      boolean;
  avecDetailsDevoir?:       boolean;
  listeDevoirs?:            HPAssignment[];
  listeServices?:           HPService[];
  moyenneGeneraleEtudiant?: HPGradeValue;
  moyenneGeneralePromo?:    HPGradeValue;
};

export type HPGradingKind = HPElement & {
  abbr?:                     string;
  couleur?:                  string;
  defaut?:                   boolean;
  coefficient?:              number;
  moyenneEleve?:             HPGradeValue;
  moyenneEleveEstSousSeuil?: boolean;
};

export type HPTranscriptAssignment = {
  id:                     string;
  note?:                  HPGradeValue;
  bareme?:                number;
  coefficient?:           number;
  commentaire?:           string;
  commeUnBonus?:          boolean;
  commeUneNote?:          boolean;
  commeUnSeuil?:          boolean;
  noteEstSousSeuil?:      boolean;
  couleur?:               string;
  listePeriodesNotation?: HPElement[];
  genreNotation?:         HPElement;
};

export type HPTranscriptService = {
  id:                            string;
  label?:                        string;
  aPrendEnCompte?:               boolean;
  baremeService?:                number;
  coefficient?:                  number;
  servicePere?:                  HPReference;
  module?:                       HPElement;
  ordre?:                        number;
  afficherSousServices?:         boolean;
  afficherMoyennesSousServices?: boolean;
  afficherMoyenneMatiere?:       boolean;
  matiere?:                      HPSubject;
  listeProfesseurs?:             HPElement[];
  listeDevoirs?:                 HPTranscriptAssignment[];
  listeGenreNotation?:           HPGradingKind[];
  listePeriodes?:                HPElement[];
  strAbsences?:                  string;
};

export type HPModule = HPElement & {
  ordre?:         number;
  coefficient?:   number;
  listePeriodes?: HPElement[];
};

/** Answer of `PageReleveDeNotes`. */
export type PageReleveDeNotesResponse = {
  message?:       string;
  maquette?:      Record<string, unknown>;
  ListeServices?: HPTranscriptService[];
  listeModules?:  HPModule[];
  general?:       Record<string, unknown> & { listePeriodes?: HPElement[] };
  pied?:          { strAbsences?: string; infoCompl?: Record<string, unknown> };
};

/** Answer of `PageBulletin` (same layout as the transcript, with appreciations). */
export type PageBulletinResponse = PageReleveDeNotesResponse & {
  maquette?:      Record<string, unknown> & { listeValidationsECTS?: HPElement[] };
  ListeServices?: Array<HPTranscriptService & { appreciation?: HPElement; pere?: HPReference }>;
};
