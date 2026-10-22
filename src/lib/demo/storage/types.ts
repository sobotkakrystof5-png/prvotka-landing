/**
 * Rozhraní soukromého úložiště souborů (D-006). Soubory jsou dostupné jen přes
 * krátce platné podepsané odkazy, nikdy přes veřejnou adresu.
 * Implementace: `r2Storage.ts` (výchozí, čeká na Q-001) a `memoryStorage.ts` (vývoj a testy).
 */

export interface SignedUrl {
  readonly url: string;
  readonly expiresAt: Date;
  /** Hlavičky, které musí prohlížeč při nahrání poslat (např. `Content-Type`). */
  readonly headers: Readonly<Record<string, string>>;
}

export interface UploadUrlOptions {
  readonly contentType: string;
  readonly maxBytes: number;
  readonly expiresInSeconds: number;
}

export interface ReadUrlOptions {
  readonly expiresInSeconds: number;
  /** Název souboru pro stažení (`Content-Disposition`). */
  readonly downloadName?: string;
}

export interface StorageAdapter {
  createUploadUrl(key: string, options: UploadUrlOptions): Promise<SignedUrl>;
  createReadUrl(key: string, options: ReadUrlOptions): Promise<SignedUrl>;
  /** Prvních `bytes` bajtů objektu (kontrola typu souboru podle obsahu). */
  readHead(key: string, bytes: number): Promise<Uint8Array>;
  deleteObject(key: string): Promise<void>;
  /** Smaže všechny objekty s předponou, vrátí jejich počet. Musí být idempotentní. */
  deleteByPrefix(prefix: string): Promise<number>;
}

export const MAX_SIGNED_URL_SECONDS = 15 * 60;

export class StorageKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StorageKeyError";
  }
}

const KEY_PATTERN = /^[a-z0-9][a-z0-9/_.-]*$/i;

/** Klíč objektu: relativní, bez `..` a prázdných segmentů. Klíče skládá jen server. */
export function assertValidKey(key: string): void {
  if (!KEY_PATTERN.test(key) || key.split("/").some((segment) => segment === "" || segment === "." || segment === "..")) {
    throw new StorageKeyError("Neplatný klíč objektu.");
  }
}

/** Předpona pro hromadné mazání musí končit lomítkem, aby `ws1/` nesmazalo i `ws10/`. */
export function assertValidPrefix(prefix: string): void {
  if (!prefix.endsWith("/")) throw new StorageKeyError("Předpona musí končit lomítkem.");
  assertValidKey(prefix.slice(0, -1));
}

export function assertExpiry(expiresInSeconds: number): void {
  if (!Number.isInteger(expiresInSeconds) || expiresInSeconds <= 0 || expiresInSeconds > MAX_SIGNED_URL_SECONDS) {
    throw new StorageKeyError(`Platnost odkazu musí být 1 až ${MAX_SIGNED_URL_SECONDS} s.`);
  }
}
