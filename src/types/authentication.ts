/**
 * Workspaces ("espaces") of a PRONOTE Campus instance.
 * The value is the `genreEspace` sent by the server in the `Start` bootstrap (`a` key).
 */
export enum HPSpace {
  TEACHER = 0,
  STUDENT = 1,
  SECRETARIAT = 7,
  APPARITEUR = 8,
  PARENT = 13,
  COMPANY = 14
}

export const HPSpacePaths: Record<HPSpace, string> = {
  [HPSpace.TEACHER]:     "enseignant",
  [HPSpace.STUDENT]:     "etudiant",
  [HPSpace.SECRETARIAT]: "secretariat",
  [HPSpace.APPARITEUR]:  "appariteur",
  [HPSpace.PARENT]:      "parent",
  [HPSpace.COMPANY]:     "entreprise"
};

export const HPSpaceNames: Record<HPSpace, string> = {
  [HPSpace.TEACHER]:     "Espace Enseignants",
  [HPSpace.STUDENT]:     "Espace Étudiants",
  [HPSpace.SECRETARIAT]: "Espace Secrétariat",
  [HPSpace.APPARITEUR]:  "Espace Appariteurs",
  [HPSpace.PARENT]:      "Espace Parents",
  [HPSpace.COMPANY]:     "Espace Entreprise"
};

export interface Workspace {
  url:  string;
  name: string;
  type: HPSpace;
}

/** Parameters of the `Start (...)` call found in the workspace HTML page. */
export interface StartParameters {
  /** Workspace kind (`genreEspace`). */
  a: HPSpace;
  b: number;
  /** Initial tab. */
  c: string;
  f: boolean;
  /** Session number. */
  i: number;
}
