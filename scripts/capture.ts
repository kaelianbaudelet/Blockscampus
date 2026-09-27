/**
 * Captures fixtures of every read-only function of a workspace of the demo instance.
 *
 * Usage: bun scripts/capture.ts <etudiant|parent|entreprise|enseignant>
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { ProbeClient } from "./probe";

const accounts = Object.fromEntries(
  readFileSync(new URL("../../identifiants.pronote-campus.txt", import.meta.url), "utf8")
    .split(/\n\s*\n+/)
    .map((block) => block.trim().split(/\n+/))
    .reduce<string[][]>((acc, lines) => {
      if (lines[0]?.startsWith("http")) acc.push([lines[0]]);
      else acc.at(-1)?.push(...lines);
      return acc;
    }, [])
    .map(([url, user, pwd]) => [url!.split("/").pop()!, { user: user!, pwd: pwd! }])
);

const space = process.argv[2] ?? "etudiant";
const account = accounts[space];
if (!account) throw new Error(`No credentials for ${space}`);

const dir = `fixtures/${space}`;
mkdirSync(dir, { recursive: true });

let client = new ProbeClient();
async function connect() {
  client = new ProbeClient();
  await client.login(space, account!.user, account!.pwd);
  await client.call("DemandeParametreUtilisateur", {}, {});
}
await connect();

const results: Record<string, any> = {};
async function run(name: string, id: string, onglet: string | undefined, data: unknown = {}) {
  const res = await client.call(id, data, client.signature(onglet));
  if (res.Erreur) await connect();
  writeFileSync(`${dir}/${name}.json`, JSON.stringify(res, null, 2));
  const err = res.Erreur ?? res.dataSec?.Signature?.MessageErreur;
  console.log(`${name.padEnd(32)} ${err ? "ERR " + JSON.stringify(err) : "ok " + JSON.stringify(res.dataSec?.data ?? {}).length + "b"}`);
  results[name] = res.dataSec?.data ?? {};
  return results[name];
}

const date = (d: Date) => ({ _T: 7, V: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}` });
const ref = (e: any) => e && ({ N: e.N, G: e.G, L: e.L });
const el = (v: any) => (v && typeof v === "object" && "V" in v ? v.V : v);

await run("DemandeParametreUtilisateur", "DemandeParametreUtilisateur", undefined);

const edt = (genreAff: number, domaine: string) => ({
  GenrePeriodeEDT: 2, GenreAffichageEDT: genreAff, FiltreRessources: { _T: 26, V: "[7]" },
  AvecIndisponibilites: false, AvecDomaineCours: true, AvecDomainePere: false, filterPlagesHoraires: false,
  ignorerCoursAnnules: false, avecInfosAppel: false, Domaine: { _T: 8, V: domaine }
});

// Cours
await run("FonctionEmploiDuTemps.grille", "FonctionEmploiDuTemps", "COURS.EDT.EDT_GRILLE", edt(0, "[4]"));
await run("FonctionEmploiDuTemps.liste", "FonctionEmploiDuTemps", "COURS.EDT.EDT_LISTE", edt(1, "[1..52]"));
await run("FonctionEmploiDuTemps.annules", "FonctionEmploiDuTemps", "COURS.COURSANNULES", edt(1, "[1..52]"));
await run("FonctionDateDebutCours", "FonctionDateDebutCours", "COURS.EDT.EDT_GRILLE");
await run("CalendrierScolaire", "CalendrierScolaire", "VIESCOLAIRE.CALENDRIERSCOLAIRE");

// Résultats
const periodes = await run("PeriodeNotation", "PeriodeNotation", "NOTATION.DERNIERESNOTES");
const periode = periodes.listePeriodes?.find((p: any) => p.N === periodes.periodeCourante?.N) ?? periodes.listePeriodes?.[0];
const publique = el(periode?.publique);
const pdata = { ressource: ref(publique), periode: { ...ref(periode), G: 2 } };
await run("PageDernieresNotes", "PageDernieresNotes", "NOTATION.DERNIERESNOTES", pdata);
await run("PageReleveDeNotes", "PageReleveDeNotes", "NOTATION.RELEVENOTES", { ...pdata, etudiant: client.membre ?? client.user });
await run("PageBulletin", "PageBulletin", "NOTATION.BULLETIN", { ...pdata, etudiant: client.membre ?? client.user });
await run("PageRecapECTS", "PageRecapECTS", "NOTATION.BULLETIN", { ...pdata, etudiant: client.membre ?? client.user });
await run("ResultatsGraphique", "ResultatsGraphique", "NOTATION.RELEVENOTES", { ...pdata, etudiant: client.membre ?? client.user });

// Vie scolaire
const from = new Date(2026, 7, 31), to = new Date(2027, 7, 15);
await run("PageReleveAbsence", "PageReleveAbsence", "VIESCOLAIRE.RELEVEABSENCE", {
  eleve: client.membre ?? client.user, dateDebut: date(from), dateFin: date(to), justifie: true, injustifie: true, uniqOblig: false
});
await run("PageScolarite", "PageScolarite", "VIESCOLAIRE.SCOLARITE");
await run("ListeSuivisEtudiant", "ListeSuivisEtudiant", "VIESCOLAIRE.SUIVIS", { eleve: client.membre ?? client.user });

// Enseignements
const prog = { ...edt(0, "[1..52]"), FiltreRessources: { _T: 26, V: "[7]" }, AvecDomaineCours: false, filterPlagesHoraires: true };
await run("Progressions.contenu", "Progressions", "ENSEIGNEMENTS.PROGRAMMECONTENU", prog);
await run("Progressions.taf", "Progressions", "ENSEIGNEMENTS.PROGRAMMETAF", prog);
await run("ListeRessourcesPeda", "ListeRessourcesPeda", "ENSEIGNEMENTS.RESSOURCESPEDAGOGIQUES", { avecURLs: false });
await run("ListeMatieres", "ListeMatieres", "ENSEIGNEMENTS.RESSOURCESPEDAGOGIQUES");
await run("DevoirsSurveilles", "DevoirsSurveilles", "ENSEIGNEMENTS.DEVOIRSURVEILLE", pdata);
await run("PageEvaluationEnseignements", "PageEvaluationEnseignements", "ENSEIGNEMENTS.EVALUATIONENSEIGNEMENT");

// En entreprise
await run("ListeOffresStages", "ListeOffresStages", "STAGE.OFFRESDESTAGE");
await run("RecupererDossiersStage", "RecupererDossiersStage", "STAGE.SAISIEDOSSIERSTAGE", { avecListesCache: true });
const stages = await run("ListeStages", "ListeStages", "STAGE.FICHESTAGE");
const stage = stages.listeStages?.[0] ?? el(stages.listeStages)?.[0];
if (stage) await run("FicheStage", "FicheStage", "STAGE.FICHESTAGE", { stage: ref(stage) });

// Communication
await run("PageInfoSondage", "PageInfoSondage", "COMMUNICATION.INFOSSONDAGES", { avecAuteur: false });
await run("CentraleNotifications", "CentraleNotifications", "ACCUEIL");

// Informations personnelles
await run("Compte", "Compte", "INFOSPERSO.COMPTE");
await run("ListeCoordonnees", "ListeCoordonnees", "INFOSPERSO.COMPTE");
await run("DocumentsATelecharger", "DocumentsATelecharger", "INFOSPERSO.DOCUMENTSTELECHARGER");
await run("Photo", "Photo", "INFOSPERSO.COMPTE", { RessourceInternet: client.membre ?? client.user });
