import type { Attachment } from "@/structures/Attachment";

export type Address = {
  lines:       string[];
  postalCode?: string;
  city?:       string;
  province?:   string;
  country?:    string;
};

export type HostCompany = {
  id:         string;
  name:       string;
  tradeName?: string;
  siret?:     string;
  headOffice: boolean;
  address:    Address;
  phone?:     string;
  mobile?:    string;
  email?:     string;
  website?:   string;
  activity?:  string;
  comment?:   string;
  manager?:   { name: string; role?: string };
  offers:     InternshipOffer[];
  documents:  Attachment[];
};

export type InternshipOffer = {
  id:              string;
  subject?:        string;
  description?:    string;
  comment?:        string;
  duration?:       string;
  durationInDays?: number;
  publishedAt?:    Date;
  positions:       number;
  filled:          number;
  attachments:     Attachment[];
};

export type InternshipSummary = {
  id:    string;
  label: string;
};

export type Internship = {
  id:              string;
  label:           string;
  dates?:          string;
  workStudy:       boolean;
  contract?:       { from?: Date; to?: Date; type?: number };
  /** Duration in months. */
  duration?:       number;
  description?:    string;
  agreementSigned: boolean;
  goals?:          string;
  activities?:     string;
  skills?:         string;
  tutor?:          string;
  referent?:       string;
  company?:        HostCompany;
  supervisors:     Array<{ name: string; role?: string }>;
  schedule:        Array<{ day: string; hours: string[] }>;
  /** Weekly duration in hours. */
  weeklyHours?:    number;
  weeks?:          number;
  days?:           number;
  attachments:     Attachment[];
};
