import { ParentLogin } from "../authentication/parent.exemple";
import { browseTimetable } from "./global.helper";

if (require.main === module) {
  main();
}

async function main() {
  const account = await ParentLogin();
  return browseTimetable(account);
}
