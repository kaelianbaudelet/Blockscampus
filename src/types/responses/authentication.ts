import type { HPElement, HPPasswordRules } from "./common";

export interface IdentificationResponse {
  alea?:        string;
  challenge:    string;
  /** When set, the username is compared lowercased. */
  modeCompLog?: number;
  /** When set, the password is compared lowercased. */
  modeCompMdp?: number;
}

/** A person linked to the account (child of a parent, student of a company...). */
export type HPMember = HPElement & {
  ListeRessources?: HPElement[];
};

export type HPAuthenticatedUser = HPElement & {
  NomComplet?:      string;
  nom?:             string;
  Email?:           string;
  /** Promotions the student belongs to. */
  ListeRessources?: HPElement[];
  /** Members the account can consult (parents, companies). */
  listeMembres?:    HPMember[];
  civilites?:       HPElement[];
};

export interface AuthentificationResponse {
  /** Set when the authentication failed. */
  Acces?:                     number;
  AccesMessage?:              string;
  cle?:                       string;
  Utilisateur?:               HPAuthenticatedUser;
  ISIDENTIFIED?:              boolean;
  libelleUtil?:               string;
  actionsDoubleAuth?:         number[];
  modesPossibles?:            number[];
  modeSecurisationParDefaut?: number;
  reglesSaisieMDP?:           HPPasswordRules;
  codePINFixe?:               boolean;
  derniereConnexion?:         Date;
  ICALDiplomes?:              boolean;
  ICALEtudiants?:             boolean;
  ICALEtudiantsPerso?:        boolean;
  ICALSalles?:                boolean;
  ICALMatieres?:              boolean;
  ICALEnseignant?:            boolean;
  ICALEnseignantPersonnel?:   boolean;
}
