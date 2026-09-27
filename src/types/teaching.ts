import type { Attachment } from "@/structures/Attachment";

export type PedagogicalResource = {
  id:          string;
  label:       string;
  /** `TypeGenreRessourcePedagogique`: 0 document, 1 website, 2 MCQ, 3 subject, 4 correction. */
  kind:        number;
  subject?:    { id: string; label: string };
  date?:       Date;
  attachment?: Attachment;
  url?:        string;
};

export type SupervisedExam = {
  id:       string;
  date:     Date;
  subject?: string;
  audience: string[];
};
