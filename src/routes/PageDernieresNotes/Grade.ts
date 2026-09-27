import type { Session } from "@/structures/Session";
import { Attachment } from "@/structures/Attachment";
import { GradeParser } from "@/structures/parsing/GradeParser";
import type { GradeValue } from "@/types/grades";
import type { HPAssignment, HPGradeValue } from "@/types/responses/grades";

export class Grade {
  constructor(
    public readonly raw: HPAssignment,
    private readonly defaultScale: number,
    private readonly session?: Session
  ) {}

  private get scale(): number {
    return this.raw.bareme ?? this.defaultScale;
  }

  private parse(value?: HPGradeValue): GradeValue | undefined {
    return value === undefined || value === "" ? undefined : GradeParser.parse(value, this.scale);
  }

  public get id(): string { return this.raw.id }

  public get value(): GradeValue | undefined { return this.parse(this.raw.note) }

  public get createdAt(): Date | undefined { return this.raw.date }

  /** Average of the promotion. */
  public get average(): GradeValue | undefined { return this.parse(this.raw.moyenne) }

  public get maximum(): GradeValue | undefined { return this.parse(this.raw.noteMax) }

  public get minimum(): GradeValue | undefined { return this.parse(this.raw.noteMin) }

  public get comment(): string | undefined { return this.raw.commentaire?.trim() || undefined }

  public get coefficient(): number { return this.raw.coefficient ?? 1 }

  /** Only counted when it raises the average. */
  public get isOptional(): boolean { return Boolean(this.raw.estFacultatifNote || this.raw.estFacultatifSeuil) }

  /** Only the points above the threshold are counted. */
  public get isBonus(): boolean { return Boolean(this.raw.estFacultatifBonus) }

  public get isConvertedTo20(): boolean { return Boolean(this.raw.estRamenerSur20) }

  /** Supervised exam ("devoir surveillé"). */
  public get isSupervisedExam(): boolean { return Boolean(this.raw.estDS) }

  /** Make-up assignment of this one, if any. */
  public get makeUp(): Grade | undefined {
    return this.raw.devoirRattrapage ? new Grade(this.raw.devoirRattrapage, this.scale, this.session) : undefined;
  }

  public get subjectFile(): Attachment | undefined {
    if (!this.session || !this.raw.libelleSujet) return undefined;
    return Attachment.create(this.session, { id: this.raw.id, label: this.raw.libelleSujet }, "DevoirSujet");
  }

  public get correctionFile(): Attachment | undefined {
    if (!this.session || !this.raw.libelleCorrige) return undefined;
    return Attachment.create(this.session, { id: this.raw.id, label: this.raw.libelleCorrige }, "DevoirCorrige");
  }
}
