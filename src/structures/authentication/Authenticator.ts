import { utf8ToBytes } from "@noble/hashes/utils.js";
import type { Workspace } from "@/types/authentication";
import type { AuthentificationResponse } from "@/types/responses/authentication";
import { Challenge } from "@/structures/Challenge";
import { AuthenticationError } from "@/structures/errors/AuthenticationError";
import type { Instance } from "@/structures/Instance";
import { Session } from "@/structures/Session";
import { Settings } from "@/structures/Settings";
import { AccountSecurity } from "@/structures/authentication/AccountSecurity";
import { User } from "@/structures/users/User";

export class Authenticator {
  public workspace?: Workspace;

  protected session?: Session;

  protected raw?: AuthentificationResponse;

  protected settings?: Settings;

  private _security?: AccountSecurity;

  constructor(
    public readonly instance: Instance
  ){}

  protected async validate() {
    if (!this.settings || !this.session || !this.raw) {
      throw new AuthenticationError("Unable to finalize the authentication.")
    }
    await this.security.execute()
    return { session: this.session, settings: this.settings, raw: this.raw }
  }

  public useWorkspace(workspace: Workspace) {
    this.workspace = workspace;
  }

  public async credentials(
    username: string,
    password: string
  ) {
    if (!this.workspace) throw new AuthenticationError("You need to select a Workspace to continue");

    this.session = await Session.create(this.instance.source, this.workspace);
    this.settings = await Settings.load(this.session);
    const challenge = await Challenge.request(this.session, username);

    await this.authenticate(this.session, challenge, username, password);
  }

  private async authenticate(session: Session, challenge: Challenge, username: string, password: string) {
    const tempKey = challenge.generateTempKey(password);
    const solution = challenge.solve(session, password);

    const response = await session.call<AuthentificationResponse>("Authentification", undefined, {
      genreConnexion:                   0,
      identifiant:                      username,
      pourENT:                          false,
      enConnexionAuto:                  false,
      demandeConnexionAuto:             false,
      enConnexionAppliMobile:           false,
      demandeConnexionAppliMobile:      false,
      demandeConnexionAppliMobileJeton: false,
      uuidAppliMobile:                  "",
      loginTokenSAV:                    "",
      challenge:                        solution
    });

    if (!response.cle) {
      throw new AuthenticationError(
        response.AccesMessage ?? "Unable to find the AES Key, please ensure that you provided the correct credentials."
      );
    }

    session.aes.updateKey(utf8ToBytes(tempKey));
    const decryptedKey = session.aes.decrypt(response.cle);
    session.aes.updateKey(new Uint8Array(decryptedKey.split(",").map(Number)));

    const user = response.Utilisateur;
    if (user) {
      session.user = { N: user.id, G: user.G, L: user.label };
    }

    this.raw = response;
  }

  public get security(): AccountSecurity {
    if (!this.session || !this.raw) throw new AuthenticationError("Unable to initiate security options yet.");
    return (this._security ??= new AccountSecurity(this.session, this.raw));
  }

  public async finalize(): Promise<User> {
    const { session, settings, raw } = await this.validate()
    return User.load(session, settings, this.instance, raw)
  }
}
