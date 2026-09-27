import { StudentLogin } from "../authentication/student.exemple";
import chalk from "chalk";
import { select } from "@inquirer/prompts";
import { EvaluationStatus, type EvaluationStatusType, type GradeValue } from "../../src";

if (require.main === module) {
  main();
}

function formatStatus(status: EvaluationStatusType) {
  switch (status) {
    case EvaluationStatus.ABSENT: return "Absent"
    case EvaluationStatus.ABSENT_WITH_ZERO: return "Absent*"
    case EvaluationStatus.DISABLED: return "Dispensé"
    case EvaluationStatus.DISTINCTION: return "Félicitations"
    case EvaluationStatus.EXCUSED: return "Inapte"
    case EvaluationStatus.INCOMPLETE: return "Non rendu"
    case EvaluationStatus.MISSING_WITH_ZERO: return "Non rendu*"
    case EvaluationStatus.UNGRADED: return "Non noté"
    default: return "Erreur"
  }
}

function formatValue(grade?: GradeValue) {
  if (!grade) return chalk.gray("—");
  return grade.status === EvaluationStatus.GRADED
    ? chalk.green(`${grade.value}/${grade.outOf}`)
    : chalk.red(formatStatus(grade.status))
}

async function main() {
  const account = await StudentLogin();
  const periods = await account.periods();

  const period = await select({
    message: "Choose the period you want to look at",
    choices: periods.map((item) => ({ name: `${item.label}${item.current ? " (current)" : ""}`, value: item }))
  })
  const grades = await account.grades(period);
  if (grades.message) console.log(chalk.yellow("*"), grades.message);

  for (const subject of grades.subjects) {
    console.log(chalk.gray("┌─ "), chalk.green(subject.label))
    for (const grade of subject.grades) {
      console.log(
        chalk.gray("│  "),
        chalk.white(grade.comment ?? grade.createdAt?.toLocaleDateString("fr-FR") ?? "Devoir"),
        chalk.gray("—"),
        formatValue(grade.value),
        chalk.dim(`(Promo: ${formatValue(grade.average)}, Min: ${formatValue(grade.minimum)}, Max: ${formatValue(grade.maximum)}, Coef: ${grade.coefficient})`)
      )
    }
    console.log(chalk.gray("└─ "), "Subject's average", formatValue(subject.average), chalk.dim(`(Promo: ${formatValue(subject.classAverage)})`))
  }
  console.log(chalk.green("\n*"), "Period's average:", formatValue(grades.average), chalk.dim(`(Promo: ${formatValue(grades.classAverage)})`));

  const transcript = await account.transcript(period);
  console.log(chalk.green("*"), "Transcript:", transcript.message ?? `${transcript.subjects.length} subjects — ${transcript.absences ?? ""}`);
  return grades;
}
