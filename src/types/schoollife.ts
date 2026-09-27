import type { Attachment } from "@/structures/Attachment";

export type Reason = {
  id:        string;
  label:     string;
  justified: boolean;
  color?:    string;
};

export type MissedSubject = {
  label:            string;
  /** Missed hours. */
  missedHours:      number;
  justifiedHours:   number;
  unjustifiedHours: number;
  plannedHours:     number;
  /** Missed lessons. */
  missedLessons:    number;
  plannedLessons:   number;
};

export type Absence = {
  id:             string;
  from:           Date;
  to:             Date;
  justified:      boolean;
  reason?:        Reason;
  justification?: string;
  subjects:       MissedSubject[];
  documents:      Attachment[];
};

export type Lateness = {
  id:             string;
  date:           Date;
  /** Duration in minutes. */
  duration:       number;
  justified:      boolean;
  reason?:        Reason;
  subject?:       string;
  justification?: string;
};

export type SchoolingHistory = {
  current: Array<{ id: string; label: string }>;
  history: Array<{ id: string; label: string; periods: Array<{ from: Date; to: Date }> }>;
};

export type FollowUp = {
  id:          string;
  label:       string;
  date:        Date;
  withTime:    boolean;
  author?:     string;
  category?:   { label: string; color?: string };
  internship?: string;
  comment?:    string;
  attachments: Attachment[];
};

export type SchoolCalendarPeriod = {
  id:        string;
  label:     string;
  weeks:     number[];
  intervals: Array<{ from: Date; to: Date }>;
  isExam:    boolean;
  color?:    string;
};

export type SchoolCalendarData = {
  label?:      string;
  periods:     SchoolCalendarPeriod[];
  internships: Array<{ id: string; label: string; workStudy: boolean; intervals: Array<{ from: Date; to: Date }> }>;
  /** Days the student is expected at school. */
  attendance:  Array<{ from: Date; to: Date }>;
};
