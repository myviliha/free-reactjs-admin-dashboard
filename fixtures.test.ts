import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

/**
 * The demo's fixtures name nobody real.
 *
 * The dev's own name and email were in the header, the profile page and the avatar gallery. A demo
 * is not a scratch file: it is the thing every buyer downloads, opens and screenshots, so a real
 * name in it is that person's name in someone else's product and in every review of it. `John Doe`
 * and its neighbours carry no one's identity, which is the entire reason those names exist.
 *
 * The list is the people actually involved, because a generic "looks like a name" check would flag
 * every product, city and label in the fixtures. Add a name here when a new person touches the repo.
 */
const REAL = ["Suman", "Bonakurthi", "suman@"];

function sources(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) sources(full, out);
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

describe("demo fixtures", () => {
  const files = sources("app");

  it("has files to check", () => {
    // A wrong working directory would scan nothing and pass.
    expect(files.length).toBeGreaterThan(20);
  });

  it("names no real person", () => {
    const found = files.flatMap((file) => {
      const body = readFileSync(file, "utf8");
      return REAL.filter((name) => body.includes(name)).map((name) => `${file}: ${name}`);
    });
    // Named, so the failure says which file and which name rather than just a count.
    expect(found).toEqual([]);
  });
});
