import { CompanyLogin } from "../authentication/company.exemple";
import { browseTimetable } from "./global.helper";

if (require.main === module) {
  main();
}

async function main() {
  const account = await CompanyLogin();
  return browseTimetable(account);
}
