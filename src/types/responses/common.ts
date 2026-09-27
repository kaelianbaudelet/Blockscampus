/**
 * Shapes shared by every PRONOTE Campus answer, once processed by `Parser.parse`
 * (`L` → `label`, `N` → `id`, typed values unwrapped).
 */

/** A generic element ("ObjetElement"): a label, an encrypted id and a kind. */
export type HPElement = {
  label: string;
  id:    string;
  /** Kind of the element ("Genre"). */
  G?:    number;
  /** Position ("Place"/order) of the element. */
  P?:    number;
};

/** Element whose label may be missing (e.g. a reference to a service). */
export type HPReference = Partial<HPElement> & { id: string };

/** Minimal element sent back to the server (raw keys, not parsed). */
export type HPRawElement = {
  N:  string;
  G?: number;
  L?: string;
};

/** Signature sent along with each request. */
export type HPSignature = {
  Onglet?:         string;
  membre?:         HPRawElement;
  listeRecherche?: HPRawElement[];
};

/** Error reported by the server inside `dataSec.Signature`. */
export type HPSignatureError = {
  Erreur?:        boolean;
  MessageErreur?: string;
};

export type HPDateInterval = {
  dateDebut: Date;
  dateFin:   Date;
};

/** A document attached to an element, downloadable through `FichiersExternes`. */
export type HPDocument = HPElement;

/** Rules applied to new passwords. */
export type HPPasswordRules = {
  min:    number;
  max:    number;
  regles: number[];
};
