import { GradeParser } from "@/structures/parsing/GradeParser";
import type { GradeValue } from "@/types/grades";
import type { HPGradeValue, HPService } from "@/types/responses/grades";
import type { Grade } from "./Grade";

export class Subject {
  constructor(
    public readonly raw: HPService,
    public readonly grades: Grade[],
    private readonly defaultScale: number
  ) {}

  private get scale(): number {
    return this.raw.baremeService ?? this.defaultScale;
  }

  private parse(value?: HPGradeValue): GradeValue | undefined {
    return value === undefined || value === "" ? undefined : GradeParser.parse(value, this.scale);
  }

  public get id(): string { return this.raw.matiere?.id ?? this.raw.id }

  public get label(): string { return this.raw.matiere?.label ?? this.raw.label ?? "" }

  public get color(): string | undefined { return this.raw.matiere?.couleur }

  public get average(): GradeValue | undefined { return this.parse(this.raw.matiere?.moyenneEtudiant) }

  public get classAverage(): GradeValue | undefined { return this.parse(this.raw.matiere?.moyenneClasse) }

  public get minimum(): GradeValue | undefined { return this.parse(this.raw.matiere?.moyenneMin) }

  public get maximum(): GradeValue | undefined { return this.parse(this.raw.matiere?.moyenneMax) }
}
