import type { SignedUrl, StorageAdapter } from "./types";

export interface R2Config {
  readonly accountId: string;
  readonly accessKeyId: string;
  readonly secretAccessKey: string;
  readonly bucket: string;
}

/**
 * Cloudflare R2 (výchozí dodavatel podle D-006). Kostra: dodavatel čeká na Q-001,
 * implementace (S3 API, podepsané odkazy, CORS jen pro náš web) přijde ve F2.
 */
export class R2Storage implements StorageAdapter {
  constructor(private readonly config: R2Config) {}

  createUploadUrl(): Promise<SignedUrl> {
    return this.notImplemented();
  }

  createReadUrl(): Promise<SignedUrl> {
    return this.notImplemented();
  }

  readHead(): Promise<Uint8Array> {
    return this.notImplemented();
  }

  deleteObject(): Promise<void> {
    return this.notImplemented();
  }

  deleteByPrefix(): Promise<number> {
    return this.notImplemented();
  }

  private notImplemented(): never {
    throw new Error(`R2Storage (${this.config.bucket}) zatím není implementované, viz Q-001 a F2.`);
  }
}
