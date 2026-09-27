import type { HPDocument, HPElement } from "./common";

/**
 * A question of an information or a survey.
 * Shape taken from the client code (`MoteurInfoSondage`), the demo instance has no news.
 */
export type HPNewsQuestion = HPElement & {
  titre?:              string;
  /** HTML content. */
  texte?:              string;
  genreReponse?:       number;
  tailleReponse?:      number;
  avecMaximum?:        boolean;
  nombreReponsesMax?:  number;
  listeChoix?:         HPElement[];
  listePiecesJointes?: HPDocument[];
  reponse?:            Record<string, unknown> & { valeurReponse?: unknown; avecReponse?: boolean };
  rang?:               number;
};

export type HPNews = HPElement & {
  estInformation?: boolean;
  dateDebut?:      Date;
  dateFin?:        Date;
  lue?:            boolean;
  auteur?:         string;
  elmAuteur?:      HPElement;
  genrePublic?:    number;
  public?:         HPElement;
  reponseAnonyme?: boolean;
  listeQuestions?: HPNewsQuestion[];
  categorie?:      HPElement;
};

/** Answer of `PageInfoSondage`. */
export type PageInfoSondageResponse = {
  listeModesAff?: Array<{ G: number; listeActualites?: HPNews[] }>;
};

export type HPNotification = HPElement & {
  date?:    Date;
  lue?:     boolean;
  message?: string;
};

/** Answer of `CentraleNotifications`. */
export type CentraleNotificationsResponse = {
  liste?:    HPNotification[];
  nbNotifs?: number;
};
