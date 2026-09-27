import type { HPElement } from "./common";

/** `TypeGenreRessourcePedagogique` */
export const HPResourceKind = {
  DOCUMENT:   0,
  WEBSITE:    1,
  MCQ:        2,
  SUBJECT:    3,
  CORRECTION: 4
} as const;

/**
 * Entry of `listeRessPeda`: either a subject header (`G` = 7, `estUnDeploiement`)
 * or a resource (`G` = 10) belonging to the previous subject.
 */
export type HPPedagogicalResource = HPElement & {
  co?:               string;
  estUnDeploiement?: boolean;
  genreRessPeda?:    number;
  strDocument?:      string;
  estEditable?:      boolean;
  matiere?:          HPElement;
  date?:             Date;
  url?:              string;
  commentaire?:      string;
};

/** Answer of `ListeRessourcesPeda`. */
export type ListeRessourcesPedaResponse = {
  listeRessPeda?: HPPedagogicalResource[];
  ListeURLSites?: Array<HPElement & { url?: string; descriptif?: string }>;
};

export type HPSupervisedExam = {
  id:               string;
  date:             Date;
  service?:         { id: string };
  matiere?:         HPElement;
  listeRessources?: HPElement[];
  label?:           string;
};

/** Answer of `DevoirsSurveilles`. */
export type DevoirsSurveillesResponse = {
  listeProchainsDS?: HPSupervisedExam[];
};

/** Answer of `PageEvaluationEnseignements`. */
export type PageEvaluationEnseignementsResponse = {
  listeServices?: Array<HPElement & { matiere?: HPElement; listePublics?: HPElement[] }>;
};
