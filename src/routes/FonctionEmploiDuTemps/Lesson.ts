import type { Schedule } from "@/structures/Schedule";
import type { LessonResource, Videoconference } from "@/types/timetable";
import {
  HPContentKind,
  type HPCanceledCourse,
  type HPContentKindValue,
  type HPCourse,
  type HPCourseContent,
  type HPCourseResource,
  type HPProgramme
} from "@/types/responses/timetable";

/** An occurrence of a course, canceled or not. */
export class Lesson {
  public readonly from: Date;

  public readonly to: Date;

  constructor(
    public readonly raw: HPCourse | HPCanceledCourse,
    schedule: Schedule,
    public readonly canceled = false
  ) {
    const { from, to } = schedule.range(raw.G, raw.p, raw.d);
    this.from = from;
    this.to = to;
  }

  private get course(): Partial<HPCourse> { return this.canceled ? {} : this.raw as HPCourse }

  private get cancellation(): Partial<HPCanceledCourse> { return this.canceled ? this.raw as HPCanceledCourse : {} }

  private get contents(): HPCourseContent[] {
    return (this.canceled ? this.cancellation.listeContenus : this.course.listeC) ?? [];
  }

  protected resources(kind: HPContentKindValue): LessonResource[] {
    return this.contents
      .filter((c) => c.G === kind)
      .flatMap((c): unknown[] => (Array.isArray(c.C) ? c.C : [c.C]))
      .filter((c): c is HPCourseResource => typeof c === "object" && c !== null && "label" in c)
      .map((c) => ({ id: c.id, label: c.label }));
  }

  protected text(kind: HPContentKindValue): string | undefined {
    const content = this.contents.find((c) => c.G === kind)?.C;
    return typeof content === "string" && content.trim() ? content : undefined;
  }

  public get id(): string { return this.raw.id }

  /** Week (1-based, from the first Monday of the year) of this occurrence. */
  public get week(): number { return this.raw.G }

  /** Duration in milliseconds. */
  public get duration(): number { return this.to.getTime() - this.from.getTime() }

  public get subject(): LessonResource | undefined { return this.resources(HPContentKind.SUBJECT)[0] }

  public get teachers(): LessonResource[] { return this.resources(HPContentKind.TEACHER) }

  public get rooms(): LessonResource[] { return this.resources(HPContentKind.ROOM) }

  public get sites(): LessonResource[] { return this.resources(HPContentKind.SITE) }

  /** Promotions, groups, tutorial groups and options attending the lesson. */
  public get audience(): LessonResource[] {
    return [
      HPContentKind.PROMOTION,
      HPContentKind.PUBLIC,
      HPContentKind.GROUP,
      HPContentKind.TUTORIAL_GROUP,
      HPContentKind.OPTION,
      HPContentKind.OTHER_PUBLIC
    ].flatMap((kind) => this.resources(kind));
  }

  /** Kind of lesson (e.g. "Cours", "TD", "Examen"). */
  public get type(): string | undefined { return this.resources(HPContentKind.TYPE)[0]?.label }

  public get memo(): string | undefined { return this.text(HPContentKind.MEMO) }

  /** Session number of the lesson in its course, when provided. */
  public get session(): string | undefined { return this.text(HPContentKind.SESSION) }

  public get color(): string | undefined {
    return this.course.co ?? this.cancellation.couleur;
  }

  /** Number of students attending the lesson. */
  public get headcount(): number | undefined {
    return this.course.nbE;
  }

  /** Every week in which the course takes place. */
  public get weeks(): number[] {
    return this.course.dom ?? this.cancellation.domaine ?? [this.raw.G];
  }

  public get cancellationReason(): string | undefined {
    return this.cancellation.motif;
  }

  /** Information about the make-up lesson (for canceled lessons) or the lesson being made up. */
  public get makeUp(): string | undefined {
    return this.cancellation.lienRattrapageHint ?? this.cancellation.strRattrapage ?? this.course.hintRattrapage;
  }

  public get isMakeUp(): boolean {
    return Boolean(this.course.estRattrapage);
  }

  /** Exemption of the student for this lesson, e.g. "Dispense sans participation requise". */
  public get exemption(): string | undefined {
    return this.course.strDispense?.trim() || undefined;
  }

  public get videoconferences(): Videoconference[] {
    return (this.course.listeLiensVisio ?? []).map((v) => ({
      label:   v.libelleLien ?? v.label,
      url:     new URL(v.url),
      comment: v.commentaire || undefined
    }));
  }

  /** Programmes (lesson contents and homework) linked to the lesson. */
  public get programmes(): HPProgramme[] {
    return this.contents
      .filter((c): c is Extract<HPCourseContent, { G: typeof HPContentKind.PROGRAMME }> => c.G === HPContentKind.PROGRAMME)
      .flatMap((c) => c.C);
  }
}
