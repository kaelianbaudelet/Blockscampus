import type { Instance } from "@/structures/Instance";
import { Schedule } from "@/structures/Schedule";
import type { Session } from "@/structures/Session";
import type { Settings } from "@/structures/Settings";
import { Timetable } from "@/routes/FonctionEmploiDuTemps/Timetable";
import type { AuthentificationResponse } from "@/types/responses/authentication";
import type { DemandeParametreUtilisateurResponse, HPTab } from "@/types/responses/user";
import type { Calendar, MenuTab, UserInfo } from "@/types/user";
import type { TimetableOptions } from "@/types/timetable";

export class User {
  public readonly schedule: Schedule;

  constructor(
    public session: Session,
    public settings: Settings,
    public instance: Instance,
    public info: UserInfo,
    public parameters: DemandeParametreUtilisateurResponse,
    public authentication: AuthentificationResponse
  ) {
    this.schedule = new Schedule(settings.schedule, parameters.Horaire);
  }

  /**
   * Loads the user settings. `DemandeParametreUtilisateur` must be called right after
   * the authentication: until then, the server answers "droits insuffisants" to every function.
   */
  public static async load<T extends User>(
    this: new (...args: ConstructorParameters<typeof User>) => T,
    session: Session,
    settings: Settings,
    instance: Instance,
    authentication: AuthentificationResponse
  ): Promise<T> {
    const parameters = await session.call<DemandeParametreUtilisateurResponse>("DemandeParametreUtilisateur");
    const u = authentication.Utilisateur;

    const info: UserInfo = {
      id:         u?.id ?? "",
      kind:       u?.G,
      name:       u?.label ?? authentication.libelleUtil ?? "",
      fullName:   u?.NomComplet ?? authentication.libelleUtil ?? u?.label ?? "",
      email:      u?.Email,
      promotions: u?.ListeRessources ?? []
    };

    return new this(session, settings, instance, info, parameters, authentication);
  }

  /** Menu of the workspace, as allowed by the server. */
  public get tabs(): MenuTab[] {
    const map = (t: HPTab): MenuTab => ({ id: t.G, label: t.label, children: (t.listeOnglets ?? []).map(map) });
    return this.parameters.listeOnglets.map(map);
  }

  /** Whether a tab (e.g. `NOTATION.DERNIERESNOTES` or `NOTATION`) is available. */
  public hasTab(path: string): boolean {
    const [root, child] = path.split(".");
    const tab = this.parameters.listeOnglets.find((t) => t.G === root);
    return Boolean(tab && (!child || tab.listeOnglets?.some((c) => c.G === child)));
  }

  /** Teaching calendars (semesters, internship periods...) with their weeks. */
  public get calendars(): Calendar[] {
    return (this.parameters.ListeCalendriers ?? []).map((c) => ({
      id:      c.id,
      label:   c.label,
      periods: c.ListePeriodes.map((p) => ({ id: p.id, label: p.label, weeks: p.Domaine }))
    }));
  }

  protected rangeOrCurrentWeek(from?: Date, to?: Date): { from: Date; to: Date } {
    if (from && to) return { from, to };

    const base = from ?? new Date();
    const monday = new Date(base.getFullYear(), base.getMonth(), base.getDate() - ((base.getDay() + 6) % 7));
    const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 7);
    return { from: from ?? monday, to: to ?? sunday };
  }

  public timetable(options: TimetableOptions = {}): Promise<Timetable> {
    const range = this.rangeOrCurrentWeek(options.from, options.to);
    return Timetable.load(this.session, this.schedule, { ...options, ...range });
  }

  public weeknumber(date = new Date()): number {
    return this.schedule.week(date);
  }
}
