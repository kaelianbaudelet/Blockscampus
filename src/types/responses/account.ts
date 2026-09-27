import type { HPDocument, HPElement, HPPasswordRules } from "./common";

/** Answer of `Compte`. Fields depend on the workspace. */
export type CompteResponse = {
  reglesSaisieMDP?:                 HPPasswordRules;
  Nom?:                             string;
  Email?:                           string;
  Email2?:                          string;
  estEmail2Principal?:              boolean;
  ine?:                             string;
  photoAutorisee?:                  boolean;
  avecPhoto?:                       boolean;
  listeInfosCVEC?:                  Array<{ code?: string }>;
  avecInformationsComplementaires?: boolean;
  regimeSocial?:                    string;
  estSportifHautNiveau?:            boolean;
  estTravailleurHandicape?:         boolean;
  aProjetCreationEntreprise?:       boolean;
  autoriserNotificationMobile?:     boolean;
  Adresse1?:                        string;
  Adresse2?:                        string;
  Adresse3?:                        string;
  Adresse4?:                        string;
  CodePostal?:                      string;
  Ville?:                           Partial<HPElement>;
  Province?:                        Partial<HPElement>;
  Pays?:                            Partial<HPElement>;
  SiteInternet?:                    string;
  IndicatifTel?:                    string;
  IndicatifFixe?:                   string;
  TelFixe?:                         string;
  IndicatifFax?:                    string;
  Fax?:                             string;
  /** Mobile phone. */
  SMS?:                             string;
  AutoriseSMS?:                     boolean;
  DestCouriers?:                    boolean;
  avecCBAutorisations?:             boolean;
  DestSMSIndependant?:              boolean;
  DestCouriersIndependant?:         boolean;
  avecProvinces?:                   boolean;
  avecPays?:                        boolean;
};

export type HPDownloadableDocument = HPElement & {
  listePJ?:         HPDocument[];
  dateLimiteDepot?: Date;
  estDocADeposer?:  boolean;
  estConsultable?:  boolean;
  estDeposable?:    boolean;
  estDepose?:       boolean;
  categorie?:       HPElement;
  date?:            Date;
};

/** Answer of `DocumentsATelecharger`. */
export type DocumentsATelechargerResponse = {
  listeDocuments?:                     HPDownloadableDocument[];
  listeDocumentsMembre?:               HPDownloadableDocument[];
  listeCategories?:                    Array<HPElement & { couleur?: string }>;
  listeDocumentsSignatureElecASigner?: HPDownloadableDocument[];
  /** Documents the student must provide. */
  listeDocumentsAFournir?:             HPDownloadableDocument[];
  listeRecapECTS?:                     HPDownloadableDocument[];
  listeBulletins?:                     HPDownloadableDocument[];
};
