import {
  assertExpiry,
  assertValidKey,
  assertValidPrefix,
  type ReadUrlOptions,
  type SignedUrl,
  type StorageAdapter,
  type UploadUrlOptions,
} from "./types";

/**
 * Úložiště v paměti procesu pro testy a lokální vývoj. V produkci ho `envSchema.ts` odmítne.
 * Odkazy mají schéma `memory://`, prohlížeč je neotevře. Obsah se vkládá přes `put`.
 */
export class MemoryStorage implements StorageAdapter {
  private readonly objects = new Map<string, Uint8Array>();

  constructor(private readonly now: () => Date = () => new Date()) {}

  /** Jen pro testy a vývoj: náhrada nahrání přes podepsaný odkaz. */
  put(key: string, body: Uint8Array): void {
    assertValidKey(key);
    this.objects.set(key, Uint8Array.from(body));
  }

  has(key: string): boolean {
    return this.objects.has(key);
  }

  async createUploadUrl(key: string, options: UploadUrlOptions): Promise<SignedUrl> {
    assertValidKey(key);
    assertExpiry(options.expiresInSeconds);
    return {
      url: `memory://upload/${key}`,
      expiresAt: this.expiry(options.expiresInSeconds),
      headers: { "Content-Type": options.contentType },
    };
  }

  async createReadUrl(key: string, options: ReadUrlOptions): Promise<SignedUrl> {
    assertValidKey(key);
    assertExpiry(options.expiresInSeconds);
    return { url: `memory://read/${key}`, expiresAt: this.expiry(options.expiresInSeconds), headers: {} };
  }

  async readHead(key: string, bytes: number): Promise<Uint8Array> {
    assertValidKey(key);
    const body = this.objects.get(key);
    if (!body) throw new Error("Objekt neexistuje.");
    return body.slice(0, Math.max(0, bytes));
  }

  async deleteObject(key: string): Promise<void> {
    assertValidKey(key);
    this.objects.delete(key);
  }

  async deleteByPrefix(prefix: string): Promise<number> {
    assertValidPrefix(prefix);
    const keys = [...this.objects.keys()].filter((key) => key.startsWith(prefix));
    keys.forEach((key) => this.objects.delete(key));
    return keys.length;
  }

  private expiry(seconds: number): Date {
    return new Date(this.now().getTime() + seconds * 1000);
  }
}
