# Offdex

Keyed object storage for the browser. Offdex wraps IndexedDB with a tiny, unbiased API so you can drop in `{ key: "<string>", ...data }` objects and have them shared across tabs, workers, and sessions without thinking about schema versions.

## Why use Offdex

- Zero schema/versioning overhead: one object store keyed by `key`, no migrations to manage.
- Minimal wrapper: no hooks or proxies in the storage API, just data in and data out.
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
  key: "profile:ada",
  name: "Ada Lovelace",
  role: "analyst",
};

await storage.put(profile);

const again = await storage.get(profile.key);
// -> { key: "profile:ada", name: "Ada Lovelace", role: "analyst" }

await storage.delete(profile.key);
```

## API

### `storage`

- Ready-to-use singleton instance shared across every import in the same origin. Uses the `offdex` database and `objects` store under the hood.

### `class ObjectStore`

- `constructor()` — opens (or creates) the `offdex` database with the `objects` store. Use this only if you need a separate instance.
- `put(object: { key: string } & Record<string, unknown>): Promise<void>` - upserts an object keyed by `key`.
- `putAll(objects: { key: string } & Record<string, unknown>[]): Promise<void>` - upserts multiple objects in a single transaction.
- `get(key: string): Promise<{ key: string } & Record<string, unknown> | undefined>` - fetches by `key`, returning `undefined` when missing.
- `delete(key: string): Promise<void>` - removes an object by `key`.
- `getAllMatches(queryOrFilter: StorageQuery | (object) => boolean): Promise<object[]>` - returns objects that pass a query or predicate.
- `deleteAllMatches(queryOrFilter: StorageQuery | (object) => boolean): Promise<void>` — deletes objects that pass a query or predicate.

### Other exports

- `StorageQuery` — helper for simple equality-based queries.
- `ObservableValue` — observable wrapper around a single value.
- `ObservableObject` — wraps an object in observable values keyed by its properties.

### Types

- `StoredObject` - `{ key: string } & Record<string, unknown>`.

## Notes

- Runs in any environment that exposes `indexedDB` (secure contexts in modern browsers).
- Data is shared per origin; open multiple tabs or workers and you will see the same store.
- There is no schema migration system; keep your stored objects backward compatible or manage migrations externally if you need them.
