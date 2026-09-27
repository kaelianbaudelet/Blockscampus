import type { HPElement } from "./responses/common";

export type UserInfo = {
  id:         string;
  kind?:      number;
  /** Short name, as displayed by PRONOTE Campus. */
  name:       string;
  fullName:   string;
  email?:     string;
  /** Promotions (classes) the user belongs to. */
  promotions: HPElement[];
};

export type Member = {
  id:         string;
  kind?:      number;
  name:       string;
  promotions: HPElement[];
};

export type MenuTab = {
  id:       string;
  label:    string;
  children: MenuTab[];
};

export type CalendarPeriod = {
  id:    string;
  label: string;
  weeks: number[];
};

export type Calendar = {
  id:      string;
  label:   string;
  periods: CalendarPeriod[];
};
