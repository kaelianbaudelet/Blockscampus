import { describe, expect, test } from "bun:test";
import { Timetable } from "@/routes/FonctionEmploiDuTemps/Timetable";
import { Grades } from "@/routes/PageDernieresNotes/Grades";
import { Transcript } from "@/routes/PageReleveDeNotes/Transcript";
import { Absences } from "@/routes/PageReleveAbsence/Absences";
import { EvaluationStatus, type GradingPeriod } from "@/types/grades";
import type { FonctionEmploiDuTempsResponse } from "@/types/responses/timetable";
import type { PageDernieresNotesResponse, PageReleveDeNotesResponse } from "@/types/responses/grades";
import type { PageReleveAbsenceResponse } from "@/types/responses/schoollife";
import { demoSchedule, demoSession, fixture } from "./helpers";

const period: GradingPeriod = { id: "37#x", label: "Trimestre 1", kind: 2, current: true };

describe("Timetable", () => {
  const schedule = demoSchedule();
  const raw = fixture<FonctionEmploiDuTempsResponse>("FonctionEmploiDuTemps.grille");
  const timetable = new Timetable(schedule, raw, { from: new Date(2026, 8, 21), to: new Date(2026, 8, 28) });

  test("places lessons and cancellations of week 4", () => {
    expect(timetable.lessons.length).toBe(9);
    const first = timetable.lessons[0]!;
    expect(first.from).toEqual(new Date(2026, 8, 21, 8, 30));
    expect(first.to).toEqual(new Date(2026, 8, 21, 10, 30));
    expect(first.subject?.label).toBe("ANGLAIS");
    expect(first.rooms.map((r) => r.label)).toEqual(["Salle H"]);
    expect(first.programmes[0]?.titreContenu).toBe("Décrire son entreprise");
  });

  test("exposes canceled lessons", () => {
    const canceled = timetable.lessons.filter((l) => l.canceled);
    expect(canceled.length).toBe(1);
    expect(canceled[0]!.from).toEqual(new Date(2026, 8, 22, 15, 30));
    expect(canceled[0]!.cancellationReason).toBe("Annulation");
  });

  test("groups lessons by day", () => {
    expect(timetable.days.map((d) => d.date.getDate())).toEqual([...new Set(timetable.lessons.map((l) => l.from.getDate()))]);
  });
});

describe("Grades", () => {
  const grades = new Grades(fixture<PageDernieresNotesResponse>("PageDernieresNotes"), period, 20);

  test("links grades to their subject", () => {
    expect(grades.average).toEqual({ value: 14, outOf: 20, status: EvaluationStatus.GRADED, disabled: false });
    expect(grades.classAverage?.value).toBe(10.65);
    expect(grades.subjects.length).toBe(3);
    for (const subject of grades.subjects) expect(subject.grades.length).toBeGreaterThan(0);
    const informatique = grades.subjects.find((s) => s.label === "INFORMATIQUE COMMERCIALE")!;
    expect(informatique.grades[0]!.value?.value).toBe(12);
    expect(informatique.grades[0]!.average?.value).toBe(11.28);
  });
});

describe("Transcript", () => {
  const transcript = new Transcript(fixture<PageReleveDeNotesResponse>("PageReleveDeNotes"), period, 20);

  test("reads subjects, assignments and averages", () => {
    expect(transcript.published).toBe(true);
    const subject = transcript.subjects.find((s) => s.assignments.length > 0)!;
    expect(subject.averages[0]?.kind).toBe("Contrôle continu");
    expect(subject.assignments[0]?.value?.value).toBeGreaterThanOrEqual(0);
    expect(transcript.absences).toContain("Absences");
  });
});

describe("Absences", () => {
  const absences = new Absences(fixture<PageReleveAbsenceResponse>("PageReleveAbsence"), demoSchedule(), demoSession());

  test("converts absences and lateness", () => {
    const first = absences.absences[0]!;
    expect(first.from).toEqual(new Date(2026, 8, 3, 8, 0));
    expect(first.to).toEqual(new Date(2026, 8, 3, 13, 0));
    expect(first.reason?.label).toBe("Maladie sans certificat");
    expect(first.subjects[0]?.plannedHours).toBeCloseTo(40);
    expect(absences.lateness[0]?.duration).toBe(5);
  });
});
