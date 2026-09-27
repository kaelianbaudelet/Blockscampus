export type GradeValue = {
  value:     number;
  outOf:     number;
  disabled?: boolean;
  status:    EvaluationStatusType;
}

/** `EGenreAnnotation`, shared with PRONOTE. */
export const EvaluationStatus = {
  ERROR:             -1,
  GRADED:             0,
  ABSENT:             1,
  DISABLED:           2,
  UNGRADED:           3,
  EXCUSED:            4,
  INCOMPLETE:         5,
  ABSENT_WITH_ZERO:   6,
  MISSING_WITH_ZERO:  7,
  DISTINCTION:        8
};

export type EvaluationStatusType = typeof EvaluationStatus[keyof typeof EvaluationStatus];

export type GradingPeriod = {
  id:            string;
  label:         string;
  /** Kind to send back to the server (`EGenreCalendrierPeriodeNotation`). */
  kind:          number;
  abbreviation?: string;
  color?:        string;
  from?:         Date;
  to?:           Date;
  /** Calendar (e.g. "Trimestriel") the period belongs to. */
  calendar?:     { id: string; label?: string };
  /** Promotion the period applies to. */
  promotion?:    { id: string; label: string; kind?: number };
  current:       boolean;
};

export type TranscriptAssignment = {
  id:          string;
  value?:      GradeValue;
  coefficient: number;
  comment?:    string;
  isBonus:     boolean;
  isOptional:  boolean;
  kind?:       string;
  periods:     string[];
};

export type TranscriptSubject = {
  id:          string;
  label:       string;
  color?:      string;
  module?:     string;
  coefficient: number;
  teachers:    string[];
  assignments: TranscriptAssignment[];
  /** Average per grading kind (e.g. "Contrôle continu"). */
  averages:    Array<{ kind: string; abbreviation?: string; coefficient: number; value?: GradeValue }>;
};
