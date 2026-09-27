import { StudentLike } from "@/structures/users/Student";
import type { Member } from "@/types/user";

/**
 * Account consulting one or several students (parents, companies).
 * Every request is made on behalf of the selected member (`membre` of the signature).
 */
export class MemberAccount extends StudentLike {
  public get members(): Member[] {
    return (this.authentication.Utilisateur?.listeMembres ?? []).map((m) => ({
      id:         m.id,
      kind:       m.G,
      name:       m.label,
      promotions: m.ListeRessources ?? []
    }));
  }

  public get member(): Member | undefined {
    const id = this.session.member?.N;
    return this.members.find((m) => m.id === id);
  }

  /** Selects the student to consult. The first one is selected by default. */
  public selectMember(member: Member): this {
    this.session.member = { N: member.id, G: member.kind, L: member.name };
    return this;
  }

  /** @internal */
  public selectDefaultMember(): this {
    const first = this.members[0];
    if (first && !this.session.member) this.selectMember(first);
    return this;
  }
}

export class Parent extends MemberAccount {}
