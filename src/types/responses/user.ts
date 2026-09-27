import type { HPElement } from "./common";

/** A tab of the menu. `G` is the tab identifier, e.g. `COURS` then `EDT`. */
export type HPTab = {
  G:             string;
  label:         string;
  listeOnglets?: HPTab[];
};

export type HPTimeGrid = {
  genreLibelleGrille: number;
  HorairesGrille:     number[];
  HorairesPlanning:   number[];
  SequencesGrille:    number[];
  SequencesPlanning:  number[];
  /** Hours of each place of a day, e.g. `{ Debut: "08h00", Fin: "08h30" }`. */
  ListeHeures:        Array<{ Debut: string; Fin?: string }>;
  ListeSequences:     string[];
};

export type HPCalendarPeriod = HPElement & {
  /** Weeks covered by the period. */
  Domaine: number[];
};

export type HPCalendar = HPElement & {
  ListePeriodes: HPCalendarPeriod[];
};

/** Answer of `DemandeParametreUtilisateur` (user settings, sent after authentication). */
export type DemandeParametreUtilisateurResponse = {
  listeOnglets:                     HPTab[];
  AvecSaisie:                       boolean;
  Horaire:                          HPTimeGrid;
  AutoriserAffichagePhoto:          boolean;
  numeroPremiereSemaine:            number;
  formatDureeEnChaine:              number;
  avecHeureFinPlaceCours:           boolean;
  PlaceDebutGrille:                 number;
  PlaceFinGrille:                   number;
  AfficherLesJoursVerticalementEDT: boolean;
  ListeCalendriers?:                HPCalendar[];
  listeMotifsAnnulation?:           HPElement[];
  notificationDemande?:             boolean;
  delaiNotificationDemande?:        number;
};
