import type { StartParameters, Workspace } from "@/types/authentication";
import type { HPRawElement, HPSignature } from "@/types/responses/common";
import { BYPASS_ID, USER_AGENT } from "@/utils/constants";
import { AES } from "@/structures/crypto/AES";
import { AuthenticationError } from "@/structures/errors/AuthenticationError";
import { Request } from "@/structures/network/Request";
import { RequestManager } from "@/structures/network/RequestManager";

export class Session {
  public manager = new RequestManager();

  public aes = new AES();

  /** The authenticated user, sent in `listeRecherche`. */
  public user?: HPRawElement;

  /** The member being consulted (child for parents, student for companies). */
  public member?: HPRawElement;

  constructor(
    public id: string,
    public source: string,
    public workspace: Workspace,
    public useCompression: boolean = false,
    public useEncryption: boolean = false,
    public useHttps: boolean = true
  ){}

  public static parseStart(html: string): StartParameters | undefined {
    const raw = html.match(/Start\s*\((\{[^}]*\})\)/)?.[1];
    if (!raw) return undefined;
    try {
      return JSON.parse(raw) as StartParameters;
    } catch {
      return undefined;
    }
  }

  public static async create(source: string, workspace: Workspace): Promise<Session> {
    const endpoint = `${source}${workspace.url}?fd=1&bydlg=${BYPASS_ID}`;
    const response = await new Request()
      .setEndpoint(endpoint)
      .setHeader("User-Agent", USER_AGENT)
      .send<string>();

    if (typeof response.data !== "string") {
      throw new AuthenticationError("Unexpected response type from PRONOTE Campus");
    }

    const start = this.parseStart(response.data);
    if (!start?.i) {
      throw new AuthenticationError("Unable to create a session for this instance");
    }

    return new Session(
      String(start.i),
      source,
      { ...workspace, type: start.a ?? workspace.type },
      /CoA/.test(response.data),
      /CrA/.test(response.data),
      source.startsWith("https")
    );
  }

  /** Builds the signature of a request made from the given tab. */
  public signature(tab?: string): HPSignature {
    const target = this.member ?? this.user;
    return {
      ...(tab ? { Onglet: tab } : {}),
      ...(this.member ? { membre: this.member } : {}),
      ...(target ? { listeRecherche: [target] } : {})
    };
  }

  /** Calls a function (`appelfonction`) of the server and returns its parsed data. */
  public async call<T>(name: string, tab?: string, data: unknown = {}): Promise<T> {
    const request = new Request().setPronotePayload(this, name, data, this.signature(tab));
    const response = await this.manager.enqueueRequest<T>(request);
    return response.data;
  }
}
