export type UUIDv4 = `${string}-${string}-${string}-${string}-${string}`;

export type StoredObject = { id: UUIDv4 } & Record<string, unknown>;

export class OfflineStorage {
  constructor();
  /**
   * Persist or overwrite an object by id.
   */
  put(object: StoredObject): Promise<void>;
  /**
   * Fetch an object by id. Returns undefined when missing.
   */
  get(id: UUIDv4): Promise<StoredObject | undefined>;
  /**
   * Remove an object by id.
   */
  delete(id: UUIDv4): Promise<void>;
}

export const storage: OfflineStorage;
