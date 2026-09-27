/**
 * End-to-end check of the wrapper against the PRONOTE Campus demo instance.
 *
 * Usage: bun scripts/smoke.ts [etudiant|parent|entreprise|enseignant]
 */
import {
  Tab,
  CompanyAuthenticator,
  Instance,
  ParentAuthenticator,
  StudentAuthenticator,
  TeacherAuthenticator,
  type Authenticator,
  type StudentLike,
  type User
} from "../src";

const DEMO = "https://hpdemofr.hyperplanning.fr/hp/";
const accounts: Record<string, [new (i: Instance) => Authenticator, string]> = {
  etudiant:   [StudentAuthenticator, "AUDIBERT"],
  parent:     [ParentAuthenticator, "AUDIBERT"],
  entreprise: [CompanyAuthenticator, "ANTOINE"],
  enseignant: [TeacherAuthenticator, "Dupont"]
};

const fmt = (d?: Date) => d?.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) ?? "?";
let failures = 0;
let current: User | undefined;

/** Tab each feature depends on: features missing from the menu of the workspace are skipped. */
const requiredTabs: Record<string, string> = {
  resources:       Tab.RESOURCES,
  supervisedExams: Tab.SUPERVISED_EXAMS,
  absences:        Tab.ABSENCES,
  schooling:       Tab.SCHOOLING
};

async function step<T>(name: string, fn: () => Promise<T>, show: (v: T) => string) {
  const tab = requiredTabs[name];
  if (tab && current && !current.hasTab(tab)) {
    console.log(`  - ${name.padEnd(18)} skipped (no ${tab} tab in this workspace)`);
    return undefined;
  }
  try {
    const value = await fn();
    console.log(`  ✔ ${name.padEnd(18)} ${show(value)}`);
    return value;
  } catch (e) {
    failures++;
    console.log(`  ✘ ${name.padEnd(18)} ${(e as Error).name}: ${(e as Error).message}`);
    return undefined;
  }
}

async function studentFeatures(user: StudentLike) {
  // The demo data is centered around the week of 21/09/2026.
  const from = new Date(2026, 8, 21), to = new Date(2026, 8, 28);

  await step("timetable", () => user.timetable({ from, to }), (t) => {
    const l = t.lessons[0];
    return `${t.lessons.length} lessons, first: ${fmt(l?.from)}-${l?.to.toLocaleTimeString("fr-FR")} ${l?.subject?.label} (${l?.rooms.map((r) => r.label)}) canceled=${t.lessons.filter((x) => x.canceled).length}`;
  });
  await step("programme", () => user.programme(new Date(2026, 8, 1), new Date(2026, 9, 1)), (p) =>
    `${p.contents.length} contents, ${p.homework.length} homework, e.g. "${p.homework[0]?.description.replace(/<[^>]+>/g, "").slice(0, 40)}" due ${fmt(p.homework[0]?.dueAt)}`);
  await step("resources", () => user.resources(), (r) => `${r.length} resources, e.g. ${r[0]?.label} → ${r[0]?.attachment?.url.pathname.slice(0, 30)}…`);
  const periods = await step("periods", () => user.periods(), (p) => p.map((x) => `${x.label}${x.current ? "*" : ""}`).join(", "));
  await step("grades", () => user.grades(), (g) =>
    `avg ${g.average?.value}/${g.average?.outOf} (promo ${g.classAverage?.value}), ${g.subjects.length} subjects, ${g.grades.length} grades ${g.message ?? ""}`);
  await step("transcript", () => user.transcript(), (t) => t.message ?? `${t.subjects.length} subjects, ${t.absences}`);
  await step("reportCard", () => user.reportCard(), (r) => r.message ?? `${r.subjects.length} subjects`);
  if (periods) await step("supervisedExams", () => user.supervisedExams(), (e) => e.map((x) => `${x.subject} ${fmt(x.date)}`).join(", "));
  await step("absences", () => user.absences(), (a) =>
    `${a.absences.length} absences (first ${fmt(a.absences[0]?.from)} → ${fmt(a.absences[0]?.to)} ${a.absences[0]?.reason?.label}), ${a.lateness.length} late (${a.lateness[0]?.duration} min)`);
  await step("schooling", () => user.schooling(), (s) => s.current.map((c) => c.label).join(", "));
  await step("followUps", () => user.followUps(), (f) => f.map((x) => `${x.label} (${x.category?.label})`).join(", "));
  await step("calendar", () => user.calendar(), (c) => `${c.periods.length} periods, ${c.internships.length} internships`);
  const internships = await step("internships", () => user.internships(), (i) => i.map((x) => x.label).join(", "));
  if (internships?.[0]) {
    await step("internship", () => user.internship(internships[0]!), (i) =>
      `${i?.company?.name} (${i?.company?.address.city}), tutor ${i?.tutor}, ${i?.schedule.length} days`);
  }
  await step("companies", () => user.companies(), (c) => `${c.length} companies, ${c.reduce((n, x) => n + x.offers.length, 0)} offers`);
  await step("news", () => user.news(), (n) => `${n.length} news`);
  await step("notifications", () => user.notifications(), (n) => `${n.length} notifications`);
  await step("account", () => user.account(), (a) => `${a.name} <${a.email}> ${a.address.city ?? ""}`);
  await step("documents", () => user.documents(), (d) => `${d.documents.length} docs, ${d.toProvide.length} to provide`);
}

async function main() {
  const instance = await Instance.createFromURL(DEMO);
  console.log(`Workspaces: ${instance.workspaces.map((w) => `${w.name} (${w.type})`).join(", ")}`);

  for (const space of process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(accounts)) {
    const [Auth, username] = accounts[space]!;
    console.log(`\n== ${space}`);
    const auth = new Auth(instance);
    const user = await step("login", async () => {
      await auth.credentials(username, "demodemo");
      return auth.finalize() as Promise<User>;
    }, (u) => `${u.info.fullName} — ${u.settings.productName} ${u.settings.version} — ${u.tabs.map((t) => t.id).join(",")}`);
    if (!user) continue;
    current = user;

    if ("members" in user) console.log(`  · members: ${(user as unknown as { members: { name: string }[] }).members.map((m) => m.name).join(", ")}`);
    if ("grades" in user) await studentFeatures(user as StudentLike);
    else await step("timetable", () => user.timetable({ from: new Date(2026, 8, 21), to: new Date(2026, 8, 28) }), (t) => `${t.lessons.length} lessons`);
  }

  console.log(failures ? `\n${failures} failure(s)` : "\nAll good");
  process.exit(failures ? 1 : 0);
}

await main();
