import { HPSpace, HPSpaceNames, HPSpacePaths, type Workspace } from "@/types/authentication";
import { Request } from "@/structures/network/Request";
import { Session } from "@/structures/Session";
import { NetworkError } from "@/structures/errors/NetworkError";

export class Instance {
  constructor(
    public source: string,
    public workspaces: Workspace[] = []
  ) {}

  /**
   * Discovers the workspaces available on a PRONOTE Campus instance.
   * Unlike PRONOTE, there is no `InfoMobileApp.json`: each known workspace page is probed.
   */
  public static async createFromURL(source: string | URL): Promise<Instance> {
    source = this.cleanUrl(source);

    const spaces = Object.values(HPSpace).filter((v): v is HPSpace => typeof v === "number");
    const probes = await Promise.all(spaces.map(async (type) => {
      const url = HPSpacePaths[type];
      try {
        const response = await new Request().setEndpoint(`${source}${url}?fd=1`).send<string>();
        if (typeof response.data !== "string" || !Session.parseStart(response.data)) return undefined;
        return { url, type, name: HPSpaceNames[type] } satisfies Workspace;
      } catch {
        return undefined;
      }
    }));

    const workspaces = probes.filter((w): w is Workspace => w !== undefined);
    if (workspaces.length === 0) {
      throw new NetworkError("Unable to find any PRONOTE Campus workspace at this URL", 404);
    }

    return new Instance(source, workspaces);
  }

  public workspace(type: HPSpace): Workspace | undefined {
    return this.workspaces.find((w) => w.type === type);
  }

  /** Normalizes an instance URL, e.g. `https://x.fr/hp/etudiant?fd=1` becomes `https://x.fr/hp/`. */
  public static cleanUrl(source: string | URL): string {
    const url = source instanceof URL ? source : new URL(source.trim().startsWith("http") ? source.trim() : "https://" + source.trim());
    const pathSegments = url.pathname.split("/").filter(Boolean);
    const spacePaths = Object.values(HPSpacePaths);

    while (pathSegments.length && (
      pathSegments.at(-1)!.toLowerCase().endsWith(".html") ||
      spacePaths.includes(pathSegments.at(-1)!.toLowerCase())
    )) {
      pathSegments.pop();
    }

    const basePath = pathSegments.join("/");
    return `${url.protocol}//${url.host}/${basePath ? basePath + "/" : ""}`.toLowerCase();
  }
}
