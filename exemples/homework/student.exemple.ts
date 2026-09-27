import { StudentLogin } from "../authentication/student.exemple";
import { printContents, printHomework } from "./helper";
import chalk from "chalk";

if (require.main === module) {
  main();
}

async function main() {
  const account = await StudentLogin();
  const today = new Date();
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14);

  const programme = await account.programme(from, to);
  console.log(chalk.green("\n*"), "Lesson contents\n");
  printContents(programme.contents);
  console.log(chalk.green("\n*"), "Homework\n");
  printHomework(programme.homework);
  return programme;
}
