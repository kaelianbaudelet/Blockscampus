import { describe, expect, test } from "bun:test";
import { createCipheriv, createHash } from "node:crypto";
import { Challenge } from "@/structures/Challenge";
import { demoSession } from "./helpers";

const md5 = (b: Buffer) => createHash("md5").update(b).digest();

describe("Challenge", () => {
  const alea = "{7201BBCF-3F34-068C-A41D-334D968571B0}";
  const expectedHash = createHash("sha256").update(alea + "demodemo").digest("hex").toUpperCase();

  test("builds the temporary key following the case rules", () => {
    expect(new Challenge("AUDIBERT", "", alea, true, false).generateTempKey("demodemo")).toBe(`audibert${expectedHash}`);
    expect(new Challenge("AUDIBERT", "", alea, false, false).generateTempKey("demodemo")).toBe(`AUDIBERT${expectedHash}`);
    expect(new Challenge("AUDIBERT", "", alea, true, true).generateTempKey("DemoDemo")).toBe(`audibert${expectedHash}`);
  });

  test("encrypts the raw challenge with the temporary key and resets it", () => {
    const session = demoSession();
    const challenge = new Challenge("AUDIBERT", "F47F675F14CDD68FEDCFA42EFCF878AE", alea, true, false);

    const key = Buffer.from(`audibert${expectedHash}`);
    const cipher = createCipheriv("aes-128-cbc", md5(key), Buffer.alloc(16));
    const expected = Buffer.concat([cipher.update("F47F675F14CDD68FEDCFA42EFCF878AE"), cipher.final()]).toString("hex");

    expect(challenge.solve(session, "demodemo")).toBe(expected);
    // The session key is back to the empty key.
    expect(session.aes.encrypt("1")).toBe(new (session.aes.constructor as new () => typeof session.aes)().encrypt("1"));
  });
});
