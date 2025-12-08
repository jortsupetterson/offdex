export type UUIDv4 = `${string}-${string}-${string}-${string}-${string}`;

export type StoredObject = { id: UUIDv4 } & Record<string, unknown>;
