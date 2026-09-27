import { HPSpace } from "@/types/authentication";
import type { Instance } from "@/structures/Instance";
import { Teacher } from "@/structures/users/Teacher";
import { Authenticator } from "@/structures/authentication/Authenticator";

export class TeacherAuthenticator extends Authenticator {
  constructor(instance: Instance) {
    super(instance);
    this.workspace = instance.workspace(HPSpace.TEACHER);
  }

  public override async finalize(): Promise<Teacher> {
    const { session, settings, raw } = await super.validate()
    return await Teacher.load(session, settings, this.instance, raw)
  }
}
