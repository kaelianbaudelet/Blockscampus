import type { Lesson, Timetable, User } from "../../src";
import { select } from "@inquirer/prompts";
import chalk from "chalk";

const time = (d: Date) => d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

export function printLessons(lessons: readonly Lesson[]) {
  for (const lesson of lessons) {
    console.log(chalk.cyan("┌─ ") + chalk.bold.yellow(time(lesson.from)) + chalk.cyan(" → ") + chalk.bold.yellow(time(lesson.to)));

    const subject = lesson.subject?.label ?? "Unknown";
    const type = lesson.type ? chalk.gray(` [${lesson.type}]`) : "";
    console.log(chalk.cyan("│  ") + (lesson.canceled ? chalk.bold.red(`${subject} (canceled: ${lesson.cancellationReason})`) : chalk.bold.blue(subject)) + type);
    if (lesson.exemption) console.log(chalk.cyan("│  ") + chalk.magenta(lesson.exemption));
    if (lesson.makeUp) console.log(chalk.cyan("│  ") + chalk.magenta(lesson.makeUp));
    for (const programme of lesson.programmes) {
      console.log(chalk.cyan("│  ") + chalk.green(`📘 ${programme.titreContenu ?? programme.label}`));
    }
    for (const visio of lesson.videoconferences) console.log(chalk.cyan("│  ") + chalk.gray(`🎥 ${visio.url}`));

    const rooms = lesson.rooms.map((r) => r.label).join(", ") || "Unknown";
    const teachers = lesson.teachers.map((t) => t.label).join(", ") || "Unknown";
    console.log(chalk.cyan("└─ ") + chalk.gray(`${rooms} - ${teachers}`) + "\n");
  }
}

/** Asks for a week, then a day of the timetable and prints it. */
export async function browseTimetable(account: User): Promise<Timetable> {
  const today = new Date();
  const from = await select({
    message: "Choose the week",
    choices: [-1, 0, 1, 2].map((offset) => {
      const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
      return { name: `Week of ${monday.toLocaleDateString("fr-FR")} (#${account.weeknumber(monday)})`, value: monday };
    })
  });
  const to = new Date(from.getFullYear(), from.getMonth(), from.getDate() + 7);

  const timetable = await account.timetable({ from, to });
  if (timetable.days.length === 0) {
    console.log(chalk.yellow("*"), "No lessons this week.");
    return timetable;
  }

  const day = await select({
    message: "Choose the day you want to view",
    choices: timetable.days.map((day) => ({ name: day.date.toLocaleDateString("fr-FR", { dateStyle: "full" }), value: day }))
  })
  console.log("\n")
  printLessons(day.lessons);
  return timetable;
}
