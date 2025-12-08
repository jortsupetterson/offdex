# Offdex

ID-first object storage for the browser. Offdex wraps IndexedDB with a tiny, stable API so you can drop in `{ id: <uuid>, ...data }` objects and have them shared across tabs, workers, and sessions without thinking about schema versions.

## Why use Offdex
- Zero schema/versioning overhead: one object store keyed by `id`, no migrations to manage.
- Works everywhere IndexedDB works: tabs, workers, and other browser runtimes share the same underlying database.
- Offline by default: IndexedDB persists across reloads and disconnects.
- Typed surface: ships with TypeScript definitions for easy adoption.

## Install
```bash
npm install offdex
```

## Quick start
```js
import { storage } from "offdex";

const profile = {
  id: crypto.randomUUID(), // UUIDv4 string
  name: "Ada Lovelace",
  role: "analyst"
};

await storage.put(profile);

const again = await storage.get(profile.id);
// -> { id: "…", name: "Ada Lovelace", role: "analyst" }

await storage.delete(profile.id);
```

## API
### `storage`
- Ready-to-use singleton instance shared across every import in the same origin. Uses the `offdex` database and `objects` store under the hood.

### `class ObjectStore`
- `constructor()` — opens (or creates) the `offdex` database with the `objects` store. Use this only if you need a separate instance.
- `put(object: { id: UUIDv4 } & Record<string, unknown>): Promise<void>` — upserts an object keyed by `id`.
- `get(id: UUIDv4, onSet?, onDelete?): Promise<{ id: UUIDv4 } & Record<string, unknown> | undefined>` — fetches by `id`, returning `undefined` when missing. Optional callbacks run before a property change/delete; return `false` to block the change.
- `delete(id: UUIDv4): Promise<void>` — removes an object by `id`.
- `getAllMatches(queryOrFilter: StorageQuery | (object) => boolean, onSet?, onDelete?): Promise<object[]>` — returns objects that pass a query or predicate (with the same optional callbacks as `get`).
- `deleteAllMatches(queryOrFilter: StorageQuery | (object) => boolean): Promise<void>` — deletes objects that pass a query or predicate.

### Other exports
- `StorageQuery` — helper for simple equality-based queries.
- `ObservableValue` — observable wrapper around a single value.
- `ObservableObject` — wraps an object in observable values keyed by its properties.

### Types
- `UUIDv4` — template literal type for UUID strings.
- `StoredObject` — `{ id: UUIDv4 } & Record<string, unknown>`.
- `OnSetHandler`, `OnDeleteHandler` — callback shapes used by `get`/`getAllMatches`.

## Notes
- Runs in any environment that exposes `indexedDB` (secure contexts in modern browsers).
- Data is shared per origin; open multiple tabs or workers and you will see the same store.
- There is no schema migration system; keep your stored objects backward compatible or manage migrations externally if you need them.
