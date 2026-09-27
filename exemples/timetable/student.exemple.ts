import { StudentLogin } from "../authentication/student.exemple";
import { browseTimetable } from "./global.helper";

if (require.main === module) {
  main();
}

async function main() {
  const account = await StudentLogin();
  return browseTimetable(account);
}
