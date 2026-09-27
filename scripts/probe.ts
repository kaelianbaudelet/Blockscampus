/**
 * Reverse-engineering helper for PRONOTE Campus (HYPERPLANNING).
 *
 * Logs into a workspace of an instance, then calls arbitrary functions and dumps
 * the raw JSON answers into `fixtures/<space>/<name>.json`.
 *
 * Usage: bun scripts/probe.ts <space> <username> <password> [calls.json]
 *   calls.json: [{ "name": "edt", "id": "FonctionEmploiDuTemps", "onglet": "COURS.EDT.EDT_GRILLE", "data": {...} }]
 */
import crypto from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.HP_BASE ?? "https://hpdemofr.hyperplanning.fr/hp";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:156.0) Gecko/20100101 Firefox/156.0";

const md5 = (b: Buffer) => crypto.createHash("md5").update(b).digest();

export class ProbeClient {
  key = Buffer.alloc(0);
  iv = Buffer.alloc(0);
  n = -1;
  sid = 0;
  esp = 0;
  user?: { N: string; G: number; L: string };
  membre?: { N: string; G: number; L: string };
  raw?: any;

  enc(s: string | Buffer, k = this.key) {
    const c = crypto.createCipheriv("aes-128-cbc", md5(k), this.iv.length ? md5(this.iv) : Buffer.alloc(16));
    return Buffer.concat([c.update(Buffer.isBuffer(s) ? s : Buffer.from(s)), c.final()]).toString("hex");
  }

  dec(h: string, k = this.key) {
    const c = crypto.createDecipheriv("aes-128-cbc", md5(k), this.iv.length ? md5(this.iv) : Buffer.alloc(16));
    return Buffer.concat([c.update(Buffer.from(h, "hex")), c.final()]);
  }

  async call(id: string, data: unknown, Signature?: unknown) {
    this.n += 2;
    const no = this.enc(String(this.n));
    const r = await fetch(`${BASE}/appelfonction/${this.esp}/${this.sid}/${no}`, {
      method:  "POST",
      headers: { "User-Agent": UA, "Content-Type": "application/json" },
      body:    JSON.stringify({ session: this.sid, no, id, dataSec: { Signature, data } })
    });
    return JSON.parse(await r.text());
  }

  signature(onglet?: string) {
    const me = this.membre ?? this.user;
    return {
      ...(onglet ? { Onglet: onglet } : {}),
      ...(this.membre ? { membre: this.membre } : {}),
      ...(me ? { listeRecherche: [me] } : {})
    };
  }

  async login(space: string, username: string, password: string) {
    const html = await (await fetch(`${BASE}/${space}?fd=1`, { headers: { "User-Agent": UA } })).text();
    const start = JSON.parse(html.match(/Start \((\{[^}]*\})\)/)![1]!);
    this.sid = start.i;
    this.esp = start.a;

    const iv = crypto.randomBytes(16);
    const params = await this.call("FonctionParametres", { Uuid: iv.toString("base64"), identifiantNav: null });
    this.iv = iv;

    const ident = (await this.call("Identification", {
      genreConnexion: 0, genreEspace: this.esp, identifiant: username, pourENT: false,
      enConnexionAuto: false, demandeConnexionAuto: false, demandeConnexionAppliMobile: false,
      demandeConnexionAppliMobileJeton: false, enConnexionAppliMobile: false, uuidAppliMobile: "", loginTokenSAV: ""
    })).dataSec.data;

    const login = ident.modeCompLog ? username.toLowerCase() : username;
    const pwd = ident.modeCompMdp ? password.toLowerCase() : password;
    const hash = crypto.createHash("sha256").update(ident.alea ?? "").update(pwd.trim()).digest("hex").toUpperCase();
    const cle = Buffer.from(login + hash);

    const auth = await this.call("Authentification", {
      genreConnexion: 0, identifiant: username, pourENT: false, challenge: this.enc(ident.challenge, cle),
      enConnexionAuto: false, demandeConnexionAuto: false, enConnexionAppliMobile: false,
      demandeConnexionAppliMobile: false, demandeConnexionAppliMobileJeton: false, uuidAppliMobile: "", loginTokenSAV: ""
    });
    const a = auth.dataSec.data;
    if (!a.cle) throw new Error("Auth failed: " + JSON.stringify(auth));
    this.key = Buffer.from(this.dec(a.cle, cle).toString().split(",").map(Number));
    const u = a.Utilisateur?.V;
    if (u) this.user = { N: u.N, G: u.G, L: u.L };
    const membres = u?.listeMembres?.V;
    if (Array.isArray(membres) && membres[0]) this.membre = { N: membres[0].N, G: membres[0].G, L: membres[0].L };
    return { start, params, ident, auth };
  }
}

if (import.meta.main) {
  const [space, username, password, callsFile] = process.argv.slice(2);
  if (!space || !username || !password) {
    console.error("Usage: bun scripts/probe.ts <space> <username> <password> [calls.json]");
    process.exit(1);
  }
  const dir = `fixtures/${space}`;
  mkdirSync(dir, { recursive: true });
  const dump = (name: string, v: unknown) => writeFileSync(`${dir}/${name}.json`, JSON.stringify(v, null, 2));

  const client = new ProbeClient();
  const { start, params, ident, auth } = await client.login(space, username, password);
  dump("_Start", start);
  dump("FonctionParametres", params);
  dump("Identification", ident);
  dump("Authentification", { ...auth, dataSec: { ...auth.dataSec, data: { ...auth.dataSec.data, cle: "<redacted>" } } });

  const dpu = await client.call("DemandeParametreUtilisateur", {}, {});
  dump("DemandeParametreUtilisateur", dpu);

  const calls: Array<{ name?: string; id: string; onglet?: string; data?: unknown; signature?: unknown }> =
    callsFile ? JSON.parse(readFileSync(callsFile, "utf8")) : [];
  for (const c of calls) {
    const res = await client.call(c.id, c.data ?? {}, c.signature ?? client.signature(c.onglet));
    dump(c.name ?? c.id, res);
    const err = res.Erreur ?? res.dataSec?.Signature?.MessageErreur;
    console.log(`${c.name ?? c.id}: ${err ? "ERR " + JSON.stringify(err) : "ok " + JSON.stringify(res.dataSec?.data).length + "b"}`);
  }
}
