import type { Schedule } from "@/structures/Schedule";
import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import { Lesson } from "@/routes/FonctionEmploiDuTemps/Lesson";
import { Timetable } from "@/routes/FonctionEmploiDuTemps/Timetable";
import type { Homework, LessonContent } from "@/types/programme";
import type { FonctionEmploiDuTempsResponse, HPHomework, HPProgramme } from "@/types/responses/timetable";
import type { LessonResource } from "@/types/timetable";
import { Tab } from "@/types/tabs";

/**
 * Lesson contents and homework ("Contenu des cours" / "Travail à faire").
 * Both are served by `Progressions`, which answers like `FonctionEmploiDuTemps`
 * with the programmes embedded in each course.
 */
export class Programme {
  private _contents?: LessonContent[];

  private _homework?: Homework[];

  constructor(
    private readonly session: Session,
    private readonly schedule: Schedule,
    public readonly raw: FonctionEmploiDuTempsResponse,
    private readonly from: Date,
    private readonly to: Date
  ) {}

  public static async load(
    session: Session,
    schedule: Schedule,
    from: Date,
    to: Date,
    tab: string = Tab.LESSON_CONTENTS
  ): Promise<Programme> {
    const weeks = schedule.weeks(from, to);
    const raw = weeks.length === 0
      ? {}
      : await session.call<FonctionEmploiDuTempsResponse>(
        "Progressions",
        tab,
        { ...Timetable.payload(weeks, { withRanges: true }), AvecDomaineCours: false }
      );
    return new this(session, schedule, raw, from, to);
  }

  private toHomework(raw: HPHomework, subject?: LessonResource): Homework {
    return {
      id:             raw.id,
      subject,
      description:    raw.descriptif ?? "",
      givenAt:        raw.dateDonne,
      dueAt:          raw.datePour,
      attachments:    Attachment.list(this.session, raw.listeDocuments),
      requiresUpload: raw.copiePeutEtreDeposee,
      relatedContent: raw.contenu?.nomProgrammeContenu || undefined
    };
  }

  private content(lesson: Lesson, raw: HPProgramme): LessonContent {
    const subject = raw.matiere ? { id: raw.matiere.id, label: raw.matiere.label } : lesson.subject;
    return {
      id:            raw.id,
      lesson,
      subject,
      title:         raw.titreContenu ?? raw.NpC,
      description:   raw.DPC || undefined,
      teacher:       raw.NpP,
      attachments:   Attachment.list(this.session, [...raw.ListePJ ?? [], ...raw.documentsProgramme ?? []]),
      links:         (raw.sites ?? []).map((s) => s.label),
      homeworkGiven: (raw.listeTAFDe ?? []).map((h) => this.toHomework(h, subject)),
      homeworkDue:   (raw.listeTAFPour ?? []).map((h) => this.toHomework(h, subject))
    };
  }

  /** Every lesson of the period having a programme, with its content and homework. */
  public get contents(): readonly LessonContent[] {
    if (!this._contents) {
      this._contents = (this.raw.ListeCours ?? [])
        .map((c) => new Lesson(c, this.schedule))
        .filter((l) => l.to > this.from && l.from < this.to)
        .sort((a, b) => a.from.getTime() - b.from.getTime())
        .flatMap((lesson) => lesson.programmes.map((p) => this.content(lesson, p)));
    }
    return this._contents;
  }

  /** Unique homework of the period, sorted by due date. */
  public get homework(): readonly Homework[] {
    if (!this._homework) {
      const unique = new Map<string, Homework>();
      for (const content of this.contents) {
        for (const h of [...content.homeworkGiven, ...content.homeworkDue]) {
          if (!unique.has(h.id)) unique.set(h.id, h);
        }
      }
      this._homework = [...unique.values()]
        .sort((a, b) => (a.dueAt?.getTime() ?? 0) - (b.dueAt?.getTime() ?? 0));
    }
    return this._homework;
  }
}
