export type UUIDv4 = `${string}-${string}-${string}-${string}-${string}`;

export type StoredObject = { id: UUIDv4 } & Record<string, unknown>;

export type OnSetHandler = (
  propertyName: string,
  oldValue: unknown,
  newValue: unknown
) => void | boolean;

export type OnDeleteHandler = (
  propertyName: string,
  deletedValue: unknown
) => void | boolean;

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
  get(
    id: UUIDv4,
    onSetEvent?: OnSetHandler,
    onDeleteEvent?: OnDeleteHandler
  ): Promise<StoredObject | undefined>;
  delete(id: UUIDv4): Promise<void>;
  getAllMatches(
    queryOrFilter: StorageQuery | ((object: StoredObject) => boolean),
    onSetEvent?: OnSetHandler,
    onDeleteEvent?: OnDeleteHandler
  ): Promise<StoredObject[]>;
  deleteAllMatches(
    queryOrFilter: StorageQuery | ((object: StoredObject) => boolean)
  ): Promise<void>;
}

export const storage: ObjectStore;
