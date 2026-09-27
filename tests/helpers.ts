import { Schedule } from "@/structures/Schedule";
import { Session } from "@/structures/Session";
import { HPSpace } from "@/types/authentication";

export function demoSession(): Session {
  return new Session("123456", "https://hpdemofr.hyperplanning.fr/hp/", { url: "etudiant", name: "Espace Étudiants", type: HPSpace.STUDENT });
}

/** Schedule of the demo instance: weeks start on 31/08/2026, 20 half-hour places a day from 08h00. */
export function demoSchedule(): Schedule {
  const hour = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, "0")}h${String(minutes % 60).padStart(2, "0")}`;
  const ListeHeures = Array.from({ length: 21 }, (_, i) => (
    i < 20 ? { Debut: hour(480 + i * 30), Fin: hour(510 + i * 30) } : { Debut: hour(480 + i * 30) }
  ));

  return new Schedule(
    {
      firstMonday:   new Date(2026, 7, 31),
      lastDate:      new Date(2027, 7, 15),
      openDays:      [1, 2, 3, 4, 5],
      placesPerDay:  20,
      placesPerHour: 2,
      unplaced:      100
    },
    {
      genreLibelleGrille: 0,
      HorairesGrille:     [],
      HorairesPlanning:   [],
      SequencesGrille:    [],
      SequencesPlanning:  [],
      ListeHeures,
      ListeSequences:     []
    }
  );
}
