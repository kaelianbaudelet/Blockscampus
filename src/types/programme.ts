import type { Attachment } from "@/structures/Attachment";
import type { Lesson } from "@/routes/FonctionEmploiDuTemps/Lesson";
import type { LessonResource } from "./timetable";

export type Homework = {
  id:              string;
  subject?:        LessonResource;
  /** HTML description. */
  description:     string;
  givenAt?:        Date;
  dueAt?:          Date;
  attachments:     Attachment[];
  /** Whether the student can upload a copy. */
  requiresUpload:  boolean;
  /** Title of the lesson content the homework is related to. */
  relatedContent?: string;
};

export type LessonContent = {
  id:            string;
  lesson:        Lesson;
  subject?:      LessonResource;
  title?:        string;
  /** HTML description. */
  description?:  string;
  teacher?:      string;
  attachments:   Attachment[];
  links:         string[];
  /** Homework given during the lesson. */
  homeworkGiven: Homework[];
  /** Homework to do for the lesson. */
  homeworkDue:   Homework[];
};
