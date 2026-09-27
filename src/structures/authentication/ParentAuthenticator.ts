import { HPSpace } from "@/types/authentication";
import type { Instance } from "@/structures/Instance";
import { Parent } from "@/structures/users/Parent";
import { Authenticator } from "@/structures/authentication/Authenticator";

export class ParentAuthenticator extends Authenticator {
  constructor(instance: Instance) {
    super(instance);
    this.workspace = instance.workspace(HPSpace.PARENT);
  }

  public override async finalize(): Promise<Parent> {
    const { session, settings, raw } = await super.validate()
    return (await Parent.load(session, settings, this.instance, raw)).selectDefaultMember()
  }
}
