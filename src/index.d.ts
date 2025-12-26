export type StoredObject = { key: string } & Record<string, unknown>;

export class StorageQuery {
  constructor(args?: Record<string, unknown>);
  args: Record<string, unknown>;
  matches(object: StoredObject): boolean;
}

export class ObservableValue<T = unknown> {
  constructor(value: T, fallback?: T);
  get(): T;
  set(newValue: T): void;
  reset(): void;
  observe(event: "set" | "reset", callback: (value: T) => void): () => void;
}

export class ObservableObject<T extends StoredObject = StoredObject> {
  constructor(object: T);
  [key: string]: ObservableValue<unknown>;
}

export class ObjectStore {
  constructor();
  put(object: StoredObject): Promise<void>;
  get(key: string): Promise<StoredObject | undefined>;
  delete(key: string): Promise<void>;
  putAll(objects: StoredObject[]): Promise<void>;
  getAllMatches(
    queryOrFilter: StorageQuery | ((object: StoredObject) => boolean)
  ): Promise<StoredObject[]>;
  deleteAllMatches(
    queryOrFilter: StorageQuery | ((object: StoredObject) => boolean)
  ): Promise<void>;
}

export const storage: ObjectStore;
