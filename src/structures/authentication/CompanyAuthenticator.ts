import { HPSpace } from "@/types/authentication";
import type { Instance } from "@/structures/Instance";
import { Company } from "@/structures/users/Company";
import { Authenticator } from "@/structures/authentication/Authenticator";

export class CompanyAuthenticator extends Authenticator {
  constructor(instance: Instance) {
    super(instance);
    this.workspace = instance.workspace(HPSpace.COMPANY);
  }

  public override async finalize(): Promise<Company> {
    const { session, settings, raw } = await super.validate()
    return (await Company.load(session, settings, this.instance, raw)).selectDefaultMember()
  }
}
