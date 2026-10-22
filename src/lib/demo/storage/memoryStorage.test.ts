import { describe, expect, it } from "vitest";
import { MemoryStorage } from "./memoryStorage";
import { MAX_SIGNED_URL_SECONDS, StorageKeyError } from "./types";

const fixedNow = new Date("2026-10-22T10:00:00Z");
const bytes = (...values: number[]) => Uint8Array.from(values);

describe("MemoryStorage", () => {
  it("creates upload and read urls with the requested expiry", async () => {
    const storage = new MemoryStorage(() => fixedNow);
    const upload = await storage.createUploadUrl("workspace/ws-1/a.pdf", {
      contentType: "application/pdf",
      maxBytes: 10_000_000,
      expiresInSeconds: 300,
    });
    expect(upload.expiresAt.toISOString()).toBe("2026-10-22T10:05:00.000Z");
    expect(upload.headers).toEqual({ "Content-Type": "application/pdf" });

    const read = await storage.createReadUrl("workspace/ws-1/a.pdf", { expiresInSeconds: 60 });
    expect(read.expiresAt.toISOString()).toBe("2026-10-22T10:01:00.000Z");
  });

  it("rejects an expiry longer than the maximum", async () => {
    const storage = new MemoryStorage();
    await expect(
      storage.createReadUrl("workspace/ws-1/a.pdf", { expiresInSeconds: MAX_SIGNED_URL_SECONDS + 1 }),
    ).rejects.toThrow(StorageKeyError);
  });

  it("reads only the first bytes of an object", async () => {
    const storage = new MemoryStorage();
    storage.put("workspace/ws-1/a.pdf", bytes(0x25, 0x50, 0x44, 0x46, 0x2d, 0x31));
    expect(await storage.readHead("workspace/ws-1/a.pdf", 4)).toEqual(bytes(0x25, 0x50, 0x44, 0x46));
  });

  it("rejects path traversal and absolute keys", async () => {
    const storage = new MemoryStorage();
    for (const key of ["../secret", "/abs/key", "workspace//a", "workspace/../b", ""]) {
      await expect(storage.deleteObject(key)).rejects.toThrow(StorageKeyError);
    }
  });

  it("deletes by prefix without touching a workspace with a longer id", async () => {
    const storage = new MemoryStorage();
    storage.put("workspace/ws1/a.pdf", bytes(1));
    storage.put("workspace/ws1/b.pdf", bytes(2));
    storage.put("workspace/ws10/c.pdf", bytes(3));

    expect(await storage.deleteByPrefix("workspace/ws1/")).toBe(2);
    expect(storage.has("workspace/ws10/c.pdf")).toBe(true);
    expect(await storage.deleteByPrefix("workspace/ws1/")).toBe(0);
  });

  it("requires a prefix ending with a slash", async () => {
    await expect(new MemoryStorage().deleteByPrefix("workspace/ws1")).rejects.toThrow(StorageKeyError);
  });
});
