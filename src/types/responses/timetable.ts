import type { HPDocument, HPElement, HPReference } from "./common";

/** Kind of a content of a course (`listeC[].G`), see `EGenreContenu`. */
export const HPContentKind = {
  SUBJECT:        0,
  TEACHER:        1,
  PUBLIC:         2,
  ROOM:           3,
  WEIGHTING:      4,
  MEMO:           5,
  SESSION:        6,
  TYPE:           7,
  DATES:          8,
  HOURS:          9,
  SITE:           10,
  PROGRAMME:      11,
  GROUP:          12,
  PROMOTION:      13,
  TUTORIAL_GROUP: 14,
  OPTION:         15,
  OTHER_PUBLIC:   16,
  REQUEST:        17,
  STUDENT:        19,
  GRADING_PERIOD: 20,
  HEADCOUNT:      21,
  VIDEO_LINK:     23
} as const;

export type HPContentKindValue = typeof HPContentKind[keyof typeof HPContentKind];

/** A resource of a course (teacher, room, promotion...). `p` tells whether the user can open it. */
export type HPCourseResource = HPElement & {
  p?: boolean;
  /** Color of a course type. */
  c?: string;
};

export type HPCourseContent =
  | { G: typeof HPContentKind.PROGRAMME; C: HPProgramme[] }
  | { G: Exclude<HPContentKindValue, typeof HPContentKind.PROGRAMME>; C: HPCourseResource | HPCourseResource[] | string };

export type HPVideoLink = HPElement & {
  libelleLien:          string;
  url:                  string;
  commentaire?:         string;
  descriptif?:          string;
  concerneProgression?: boolean;
};

/** Homework ("travail à faire") attached to a programme. */
export type HPHomework = {
  id:                   string;
  G:                    number;
  genreRenduTAF:        number;
  copiePeutEtreDeposee: boolean;
  service?:             HPReference;
  /** HTML description. */
  descriptif:           string;
  nrSeanceDonne?:       number;
  dateDonne?:           Date;
  nrSeancePour?:        number;
  datePour?:            Date;
  listeDocuments?:      HPDocument[];
  avecContenu?:         boolean;
  contenu?:              HPElement & {
    nomProgrammeContenu?:         string;
    descriptionProgrammeContenu?: string;
    documentsProgramme?:          HPDocument[];
    sitesProgramme?:              HPElement[];
  };
};

/** Programme ("progression") of a course: the lesson content and its homework. */
export type HPProgramme = HPElement & {
  matiere?:            HPCourseResource;
  avecContenu:         boolean;
  titreContenu?:       string;
  avecContenuPJ?:      boolean;
  avecTAD?:            boolean;
  avecTADPJ?:          boolean;
  avecTAF?:            boolean;
  avecTAFPJ?:          boolean;
  avecDocuments?:      boolean;
  /** Name of the content ("nom programme contenu"). */
  NpC?:                string;
  /** Name of the teacher. */
  NpP?:                string;
  /** HTML description of the content. */
  DPC?:                string;
  ListePJ?:            HPDocument[];
  sites?:              HPElement[];
  documentsProgramme?: HPDocument[];
  /** Homework given during this lesson. */
  listeTAFDe?:         HPHomework[];
  /** Homework due for this lesson. */
  listeTAFPour?:       HPHomework[];
};

export type HPOral = {
  id:       string;
  details?:  Array<{
    id:          string;
    matiere?:    HPElement & { couleur?: string };
    ressources?: HPElement[];
    estPublie?:  boolean;
  }>;
  etatValide?: boolean;
  avecConvoc?: boolean;
};

export type HPCourse = {
  id:               string;
  /** Week ("cycle") of this occurrence. */
  G:                number;
  /** Place of the beginning of the course in the week. */
  p:                number;
  /** Duration, in places. */
  d:                number;
  /** State of the course. */
  e?:               number;
  /** Background color. */
  co?:              string;
  /** Number of students. */
  nbE?:             number;
  /** All the weeks of the course. */
  dom?:             number[];
  domP?:            number[];
  listeC?:          HPCourseContent[];
  avecVisio?:       boolean;
  listeLiensVisio?: HPVideoLink[];
  strDispense?:     string;
  estRattrapage?:   boolean;
  hintRattrapage?:  string;
  oral?:            HPOral;
  pub?:             boolean;
  util?:            boolean;
};

export type HPCanceledCourse = {
  id:                  string;
  /** Week ("cycle") of the canceled occurrence. */
  G:                   number;
  motif?:              string;
  p:                   number;
  d:                   number;
  couleur?:            string;
  domaine?:            number[];
  listeContenus?:      HPCourseContent[];
  lienRattrapage?:     string;
  lienRattrapageHint?: string;
  strRattrapage?:      string;
  estRemunere?:        boolean;
  commentaire?:        string;
};

/** Answer of `FonctionEmploiDuTemps` and `Progressions`. */
export type FonctionEmploiDuTempsResponse = {
  ListeCours?:            HPCourse[];
  ListeAnnulationsCours?: HPCanceledCourse[];
  OrdreContenuDuCours?:   number[];
  stages?:                Record<string, unknown>;
  message?:               string;
};
