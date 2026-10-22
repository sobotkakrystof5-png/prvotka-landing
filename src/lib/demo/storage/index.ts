import "server-only";
import { requireDemoConfig } from "@/lib/demo/env";
import { MemoryStorage } from "./memoryStorage";
import { R2Storage } from "./r2Storage";
import type { StorageAdapter } from "./types";

let storage: StorageAdapter | undefined;

/** Úložiště podle `STORAGE_DRIVER`. Klíče objektů skládá jen server (`workspace/<id>/…`). */
export function getStorage(): StorageAdapter {
  if (storage) return storage;
  const config = requireDemoConfig();
  storage =
    config.STORAGE_DRIVER === "r2"
      ? new R2Storage({
          accountId: config.STORAGE_R2_ACCOUNT_ID,
          accessKeyId: config.STORAGE_R2_ACCESS_KEY_ID,
          secretAccessKey: config.STORAGE_R2_SECRET_ACCESS_KEY,
          bucket: config.STORAGE_BUCKET,
        })
      : new MemoryStorage();
  return storage;
}

export type { StorageAdapter } from "./types";
