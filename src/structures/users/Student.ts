import { User } from "@/structures/users/User";
import { Programme } from "@/routes/Progressions/Programme";
import { GradingPeriods } from "@/routes/PeriodeNotation/GradingPeriods";
import { Grades } from "@/routes/PageDernieresNotes/Grades";
import { Transcript } from "@/routes/PageReleveDeNotes/Transcript";
import { ReportCard } from "@/routes/PageBulletin/ReportCard";
import { Absences } from "@/routes/PageReleveAbsence/Absences";
import { Schooling } from "@/routes/PageScolarite/Schooling";
import { FollowUps } from "@/routes/ListeSuivisEtudiant/FollowUps";
import { SchoolCalendar } from "@/routes/CalendrierScolaire/SchoolCalendar";
import { Resources } from "@/routes/ListeRessourcesPeda/Resources";
import { SupervisedExams } from "@/routes/DevoirsSurveilles/SupervisedExams";
import { Internships } from "@/routes/Stages/Internships";
import { News, type NewsItem, type Notification } from "@/routes/PageInfoSondage/News";
import { Account, type AccountInformation, type PersonalDocuments } from "@/routes/Compte/Account";
import type { GradingPeriod } from "@/types/grades";
import type { HostCompany, Internship, InternshipSummary } from "@/types/internship";
import type { FollowUp, SchoolCalendarData, SchoolingHistory } from "@/types/schoollife";
import type { PedagogicalResource, SupervisedExam } from "@/types/teaching";
import { Tab } from "@/types/tabs";

/**
 * Features available when consulting a student: the student workspace itself,
 * and the parent and company workspaces once a member is selected.
 */
export class StudentLike extends User {
  private _periods?: GradingPeriod[];

  // ─── Cours / Enseignements ───────────────────────────────────────────────

  /** Lesson contents and homework between two dates (current week by default). */
  public programme(from?: Date, to?: Date): Promise<Programme> {
    const range = this.rangeOrCurrentWeek(from, to);
    const tab = this.hasTab(Tab.LESSON_CONTENTS) ? Tab.LESSON_CONTENTS : Tab.HOMEWORK;
    return Programme.load(this.session, this.schedule, range.from, range.to, tab);
  }

  public async homework(from?: Date, to?: Date) {
    return (await this.programme(from, to)).homework;
  }

  public resources(): Promise<PedagogicalResource[]> {
    return Resources.load(this.session);
  }

  public async supervisedExams(period?: GradingPeriod): Promise<SupervisedExam[]> {
    return SupervisedExams.load(this.session, period ?? await this.currentPeriod());
  }

  // ─── Résultats ───────────────────────────────────────────────────────────

  /** Grading periods (trimesters, mock exams...). Cached. */
  public async periods(): Promise<GradingPeriod[]> {
    return (this._periods ??= await GradingPeriods.load(this.session));
  }

  public async currentPeriod(): Promise<GradingPeriod> {
    const period = GradingPeriods.current(await this.periods());
    if (!period) throw new Error("No grading period is available for this user.");
    return period;
  }

  public async grades(period?: GradingPeriod): Promise<Grades> {
    return Grades.load(this.session, period ?? await this.currentPeriod(), this.settings.grading.scale);
  }

  public async transcript(period?: GradingPeriod): Promise<Transcript> {
    return Transcript.load(this.session, period ?? await this.currentPeriod(), this.settings.grading.scale);
  }

  public async reportCard(period?: GradingPeriod): Promise<ReportCard> {
    return ReportCard.load(this.session, period ?? await this.currentPeriod(), this.settings.grading.scale);
  }

  // ─── Vie scolaire ────────────────────────────────────────────────────────

  /** Absences and lateness, for the whole school year by default. */
  public absences(from?: Date, to?: Date): Promise<Absences> {
    return Absences.load(
      this.session,
      this.schedule,
      from ?? this.settings.schedule.firstMonday,
      to ?? this.settings.schedule.lastDate
    );
  }

  public schooling(): Promise<SchoolingHistory> {
    return Schooling.load(this.session);
  }

  public followUps(): Promise<FollowUp[]> {
    return FollowUps.load(this.session, this.hasTab(Tab.FOLLOW_UPS) ? Tab.FOLLOW_UPS : Tab.INTERNSHIP_FOLLOW_UPS);
  }

  public calendar(): Promise<SchoolCalendarData> {
    return SchoolCalendar.load(this.session);
  }

  // ─── En entreprise ───────────────────────────────────────────────────────

  public internships(): Promise<InternshipSummary[]> {
    return Internships.list(this.session);
  }

  public internship(summary: InternshipSummary): Promise<Internship | undefined> {
    return Internships.get(this.session, summary);
  }

  public companies(): Promise<HostCompany[]> {
    return Internships.companies(this.session);
  }

  // ─── Communication ───────────────────────────────────────────────────────

  public news(): Promise<NewsItem[]> {
    return News.load(this.session);
  }

  public notifications(): Promise<Notification[]> {
    return News.notifications(this.session);
  }

  // ─── Informations personnelles ───────────────────────────────────────────

  public account(): Promise<AccountInformation> {
    return Account.load(this.session);
  }

  public documents(): Promise<PersonalDocuments> {
    return Account.documents(this.session);
  }
}

export class Student extends StudentLike {}
