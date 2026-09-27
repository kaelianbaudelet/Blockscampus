export type Language = {
  id:    number;
  label: string;
};

export type SchoolInfo = {
  name:     string;
  logoUrl?: string;
};

export type GradingSettings = {
  /** Default scale of grades (usually 20). */
  scale:      number;
  maxGrade:   number;
  /** Number of decimals kept when displaying grades. */
  decimals:   number;
  /** Grade under which an average is considered insufficient. */
  threshold?: number;
};

export type ScheduleSettings = {
  /** Monday of the first week of the year. */
  firstMonday:   Date;
  lastDate:      Date;
  /** Working days, 1 = Monday. */
  openDays:      number[];
  placesPerDay:  number;
  placesPerHour: number;
  /** Value of `place` for courses that are not positioned in the grid. */
  unplaced:      number;
};

export type FeatureSettings = {
  mcq:         boolean;
  students:    boolean;
  parents:     boolean;
  internships: boolean;
  workStudy:   boolean;
  forum:       boolean;
};

export type LinksSettings = {
  help?:                     string;
  indexEducationWebsite?:    string;
  hostingInfo?:              string;
  privacyPolicy?:            string;
  faqTwoFactorRegistration?: string;
  securityTutorialVideo?:    string;
  registerDevicesTutorial?:  string;
  accessibilityDeclaration?: string;
};
