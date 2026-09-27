import { TeacherLogin } from "../authentication/teacher.exemple";
import { browseTimetable } from "./global.helper";

if (require.main === module) {
  main();
}

async function main() {
  const account = await TeacherLogin();
  return browseTimetable(account);
}
