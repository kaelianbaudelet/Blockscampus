import type { HPDocument, HPElement } from "./common";

export type HPCompanyContact = HPElement & {
  fonction?: string;
};

export type HPInternshipOffer = {
  id:             string;
  sujet?:         Partial<HPElement>;
  sujetDetaille?: string;
  commentaire?:   string;
  /** e.g. "10 semaines" */
  duree?:         string;
  dureeEnJours?:  number;
  periodes?:      Array<{ dateDebut?: Date; dateFin?: Date }>;
  date?:          Date;
  nbPropose?:     number;
  nbPourvus?:     number;
  piecesjointes?: HPDocument[];
};

export type HPCompany = HPElement & {
  siret?:             string;
  nomCommercial?:     string;
  estSiegeSocial?:    boolean;
  adresse1?:          string;
  adresse2?:          string;
  adresse3?:          string;
  adresse4?:          string;
  codePostal?:        string;
  ville?:             string;
  province?:          string;
  pays?:              string;
  /** Phone numbers, depending on the endpoint. */
  numeroFixe?:        string;
  numeroMobile?:      string;
  telephoneFixe?:     string;
  portable?:          string;
  email?:             string;
  siteInternet?:      string;
  activite?:          HPElement;
  documents?:         HPDocument[];
  commentairePublie?: string;
  responsable?:       HPCompanyContact;
  listeOffresStages?: HPInternshipOffer[];
};

/** Answer of `ListeOffresStages`. */
export type ListeOffresStagesResponse = {
  listeEntreprises?: HPCompany[];
};

/** Answer of `ListeStages`. */
export type ListeStagesResponse = {
  listeStages?:     HPElement[];
  listeEvenements?: Array<HPElement & { couleur?: string }>;
};

export type HPInternshipDay = {
  G:             number;
  label:         string;
  horaires?:     Array<{ G: number; label: string }>;
  /** Duration, in days. */
  dureeJournee?: number;
};

export type HPInternshipSheet = HPElement & {
  libelleDates?:          string;
  /** Duration, in months. */
  dureeStage?:            number;
  estAlternance?:         boolean;
  typeContrat?:           number;
  dateDebutContrat?:      Date;
  dateFinContrat?:        Date;
  sujetDetaille?:         string;
  conventionSignee?:      boolean;
  objectifs?:             string;
  activitesPrevues?:      string;
  competencesVisees?:     string;
  modalitesConcertation?: string;
  modalitesEvaluation?:   string;
  enseignantTuteur?:      HPElement;
  enseignantResponsable?: HPElement;
  piecesjointes?:         HPDocument[];
  entreprise?:            HPCompany;
  maitresDeStage?:        HPCompanyContact[];
  chargesDeContrat?:      HPCompanyContact[];
  jours?:                 HPInternshipDay[];
  /** Weekly duration, in days. */
  dureeHebdomadaire?:     number;
  nbSemaines?:            number;
  nbJours?:               number;
  dureeAbsence?:          number;
};

/** Answer of `FicheStage`. */
export type FicheStageResponse = {
  ficheStage?: HPInternshipSheet;
};
