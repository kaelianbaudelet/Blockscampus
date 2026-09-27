import type { Homework, LessonContent } from "../../src";
import chalk from "chalk";

export const stripHtml = (html = "") => html.replace(/<[^>]*>?/gm, "").replaceAll("&nbsp;", " ").trim();

export function printHomework(homework: readonly Homework[]) {
  for (const h of homework) {
    console.log(chalk.cyan("┌─ ") + chalk.bold.blue(h.subject?.label ?? "Unknown") + chalk.gray(` — due ${h.dueAt?.toLocaleString("fr-FR") ?? "?"}`));
    console.log(chalk.cyan("│  ") + stripHtml(h.description));
    for (const attachment of h.attachments) console.log(chalk.cyan("│  ") + chalk.gray(`📎 ${attachment.name}: ${attachment.url}`));
    console.log(chalk.cyan("└─ ") + chalk.gray(`given ${h.givenAt?.toLocaleString("fr-FR") ?? "?"}`) + "\n");
  }
}

export function printContents(contents: readonly LessonContent[]) {
  for (const c of contents) {
    console.log(chalk.cyan("• ") + chalk.gray(c.lesson.from.toLocaleString("fr-FR")) + " " + chalk.bold(c.subject?.label ?? "") + " — " + (c.title ?? "")
      + (c.description ? chalk.gray(` (${stripHtml(c.description).slice(0, 80)})`) : ""));
  }
}
