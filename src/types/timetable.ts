import type { Lesson } from "@/routes/FonctionEmploiDuTemps/Lesson";

export type TimetableOptions = {
  from?:           Date;
  to?:             Date;
  /** Skip canceled lessons. */
  ignoreCanceled?: boolean;
};

export type TimetableDay = {
  date:    Date;
  lessons: Lesson[];
};

export type Videoconference = {
  label:    string;
  url:      URL;
  comment?: string;
};

export type LessonResource = {
  id:    string;
  label: string;
};
