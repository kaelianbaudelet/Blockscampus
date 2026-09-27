import type { HPDateInterval, HPDocument, HPElement } from "./common";

export type HPReason = HPElement & {
  Couleur?:      string;
  EstJustifie?:  boolean;
  EstParDefaut?: boolean;
  /** "J" (justified) or "I" (unjustified). */
  Statut?:       string;
};

export type HPAbsenceDetails = {
  estUneCreationParent?: boolean;
  justification?:        string;
  motifParent?:          Partial<HPElement>;
  documents?:            HPDocument[];
};

/** Hours (in days) or number of missed lessons of a subject. */
export type HPMissedLessons = {
  /** Absences on the period. */
  DACours?:       number;
  DACoursP?:      number;
  /** Justified absences. */
  DAJCoursP?:     number;
  /** Unjustified absences. */
  DAICoursP?:     number;
  /** Planned lessons. */
  DCoursPrevusP?: number;
};

export type HPAbsence = {
  id:                              string;
  G:                               number;
  /** Week and place of the beginning. */
  SD:                              number;
  PD:                              number;
  /** Week and place of the end. */
  SF:                              number;
  PF:                              number;
  /** Whether the absence is justified ("réglée"). */
  R?:                              boolean;
  estRegleAdministrativement?:     boolean;
  estUneCreationParentModifiable?: boolean;
  details?:                        HPAbsenceDetails;
  ListeMatieres?:                  Array<HPElement & {
    enDuree?:   HPMissedLessons;
    enNombre?:  HPMissedLessons;
    promotion?: HPElement;
  }>;
  MotifAbsence?: HPReason;
};

export type HPLateness = {
  id:                          string;
  G:                           number;
  date:                        Date;
  /** Duration, in days. */
  duree:                       number;
  estElementVSJustifie?:       boolean;
  estRegleAdministrativement?: boolean;
  motifRetard?:                HPReason;
  details?:                    HPAbsenceDetails;
  matiere?:                    HPElement;
};

/** Answer of `PageReleveAbsence`. */
export type PageReleveAbsenceResponse = {
  listeMotifsAbsences?:            HPReason[];
  listeMotifsRetards?:             HPReason[];
  avecDeclarationNouvelleAbsence?: boolean;
  avecJustificationAbsence?:       boolean;
  avecJustificationRetard?:        boolean;
  nbMaxJoursDeclarationAbsence?:   number;
  ListeAbsences?:                  HPAbsence[];
  listeRetards?:                   HPLateness[];
};

/** Answer of `PageScolarite`. */
export type PageScolariteResponse = {
  Date?:                       Date;
  listeRessourcesActuelles?:   HPElement[];
  listeRessourcesHistoriques?: Array<HPElement & { dates?: HPDateInterval[] }>;
};

export type HPFollowUp = HPElement & {
  date:                 Date;
  avecHeure?:           boolean;
  auteur?:              HPElement;
  stage?:               HPElement;
  categorie?:           HPElement & { couleur?: string };
  commentaire?:         string;
  listePiecesJointes?:  HPDocument[];
  genresDestinataires?: number[];
  nbrActionsSuivi?:     number;
  avecEdition?:         boolean;
};

/** Answer of `ListeSuivisEtudiant`. */
export type ListeSuivisEtudiantResponse = {
  listeSuivis?:          HPFollowUp[];
  avecDroitCreerSuivi?:  boolean;
  listeStagesEtudiant?:  HPElement[];
  listeCategoriesSuivi?: Array<HPElement & { estParDefaut?: boolean; couleur?: string }>;
  listePartagePossible?: number[];
};

export type HPSchoolPeriod = HPElement & {
  P?:                number;
  domaine?:          number[];
  listeIntervalles?: HPDateInterval[];
  estExamen?:        boolean;
  couleur?:          string;
};

/** Answer of `CalendrierScolaire`. */
export type CalendrierScolaireResponse = {
  calendrier?:  HPElement & { listePeriodes?: HPSchoolPeriod[] };
  listeStages?:         Array<HPElement & {
    estAlternance?:    boolean;
    listeIntervalles?: Array<HPDateInterval & { label?: string }>;
  }>;
  PeriodeConsultation?: number[];
  listeJourPresence?:   HPDateInterval[];
};
