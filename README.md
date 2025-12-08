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
import { OfflineStorage } from "offdex";

const storage = new OfflineStorage();

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
### `class OfflineStorage`
- `constructor()` — opens (or creates) the `offline` database with the `objects` store.
- `put(object: { id: UUIDv4 } & Record<string, unknown>): Promise<void>` — upserts an object keyed by `id`.
- `get(id: UUIDv4): Promise<{ id: UUIDv4 } & Record<string, unknown> | undefined>` — fetches by `id`, returning `undefined` when missing.
- `delete(id: UUIDv4): Promise<void>` — removes an object by `id`.

### Types
- `UUIDv4` — template literal type for UUID strings.

## Notes
- Runs in any environment that exposes `indexedDB` (secure contexts in modern browsers).
- Data is shared per origin; open multiple tabs or workers and you will see the same store.
- There is no schema migration system; keep your stored objects backward compatible or manage migrations externally if you need them.

## Quick manual test
Open `in-browser-testing.html` in a browser (or serve it locally) to poke at the API from DevTools: the module attaches `OfflineStorage` to `globalThis`.
