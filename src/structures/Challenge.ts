import type { Session } from "@/structures/Session";
import type { IdentificationResponse } from "@/types/responses/authentication";
import { bytesToHex, utf8ToBytes } from "@noble/hashes/utils.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { AuthenticationError } from "./errors/AuthenticationError";

export class Challenge {
  constructor(
    public username: string,
    private challenge: string,
    private seed: string,
    private lowercaseUsername: boolean,
    private lowercasePassword: boolean
  ){}

  static async request(session: Session, username: string): Promise<Challenge> {
    const response = await session.call<IdentificationResponse>("Identification", undefined, {
      genreConnexion:                   0,
      genreEspace:                      session.workspace.type,
      identifiant:                      username,
      pourENT:                          false,
      enConnexionAuto:                  false,
      demandeConnexionAuto:             false,
      demandeConnexionAppliMobile:      false,
      demandeConnexionAppliMobileJeton: false,
      enConnexionAppliMobile:           false,
      uuidAppliMobile:                  "",
      loginTokenSAV:                    ""
    });

    if (!response.challenge) {
      throw new AuthenticationError("Unable to retrieve the authentication challenge.");
    }

    return new Challenge(
      username,
      response.challenge,
      response.alea ?? "",
      Boolean(response.modeCompLog),
      Boolean(response.modeCompMdp)
    );
  }

  /**
   * Unlike PRONOTE, PRONOTE Campus does not expect the challenge to be decrypted:
   * the raw challenge is simply encrypted with the temporary key.
   */
  public solve(session: Session, password: string): string {
    try {
      session.aes.updateKey(this.generateTempKey(password));
      return session.aes.encrypt(this.challenge);
    } catch {
      throw new AuthenticationError("Unable to solve the challenge, please ensure that you provided the correct credentials.");
    } finally {
      session.aes.resetKey();
    }
  }

  /** `login + SHA256(alea + password)`, following the case rules sent by the server. */
  public generateTempKey(password: string): string {
    const login = this.lowercaseUsername ? this.username.toLowerCase() : this.username;
    const pwd = this.lowercasePassword ? password.toLowerCase() : password;
    const hash = sha256
      .create()
      .update(utf8ToBytes(this.seed))
      .update(utf8ToBytes(pwd.trim()))
      .digest();

    return `${login}${bytesToHex(hash).toUpperCase()}`;
  }
}
