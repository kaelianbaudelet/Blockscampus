import { readFileSync } from "node:fs";
import { Parser } from "@/structures/parsing/Parser";
import { Schedule } from "@/structures/Schedule";
import { Session } from "@/structures/Session";
import { Settings } from "@/structures/Settings";
import { HPSpace } from "@/types/authentication";
import type { FonctionParametresResponse } from "@/types/responses/instance";
import type { DemandeParametreUtilisateurResponse } from "@/types/responses/user";

/** Parsed `dataSec.data` of a captured fixture. */
export function fixture<T>(name: string, space = "etudiant"): T {
  const raw = JSON.parse(readFileSync(new URL(`../fixtures/${space}/${name}.json`, import.meta.url), "utf8"));
  return Parser.parse<T>(raw.dataSec.data);
}

export function demoSession(): Session {
  return new Session("123456", "https://hpdemofr.hyperplanning.fr/hp/", { url: "etudiant", name: "Espace Étudiants", type: HPSpace.STUDENT });
}

export function demoSettings(): Settings {
  const session = demoSession();
  return Settings.fromResponse(session, fixture<FonctionParametresResponse>("FonctionParametres"));
}

export function demoSchedule(): Schedule {
  const parameters = fixture<DemandeParametreUtilisateurResponse>("DemandeParametreUtilisateur");
  return new Schedule(demoSettings().schedule, parameters.Horaire);
}
