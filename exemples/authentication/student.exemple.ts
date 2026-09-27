import { Student, StudentAuthenticator, Instance } from "../../src";
import { askForCredentials, DEMO_URL } from "./generic.exemple";
import { input } from "@inquirer/prompts";
import chalk from "chalk";

if (require.main === module) {
  StudentLogin();
}

export async function StudentLogin(): Promise<Student> {
  const url = await input({ message: "Enter the school's instance URL:", required: true, default: DEMO_URL })
  const instance = await Instance.createFromURL(url);
  const authenticator = new StudentAuthenticator(instance);

  await askForCredentials(authenticator, "AUDIBERT");

  const account = await authenticator.finalize();
  console.log(chalk.green("\n*"), "You're authenticated as", chalk.blue(account.info.fullName))
  return account;
}
