export class OfflineStorage {
  static #idb = "offline";
  static #store = "objects";

  /**
   * @returns {Promise<IDBDatabase>}
   */
  static #open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(OfflineStorage.#idb);

      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(OfflineStorage.#store)) {
          db.createObjectStore(OfflineStorage.#store, { keyPath: "id" });
        }
      });

      request.addEventListener("success", () => {
        resolve(request.result);
      });

      request.addEventListener("error", () => {
        reject(request.error);
      });
    });
  }

  constructor() {
    this.storage = OfflineStorage.#open();
  }

  /**
   * @param {import("./types").StoredObject} object
   * @returns {Promise<void>}
   */
  async put(object) {
    const db = await this.storage;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(OfflineStorage.#store, "readwrite");
      const store = tx.objectStore(OfflineStorage.#store);
      store.put(object);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`[OfflineStorage] ${tx.error}`));
    });
  }

  /**
   * @param {import("./types").UUIDv4} id
   * @returns {Promise<import("./types").StoredObject | undefined>}
   */
  async get(id) {
    const db = await this.storage;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(OfflineStorage.#store, "readonly");
      const store = tx.objectStore(OfflineStorage.#store);
      const request = store.get(id);

      tx.oncomplete = () => {
        resolve(request.result ? request.result : undefined);
      };
      tx.onerror = () => reject(new Error(`[OfflineStorage] ${tx.error}`));
    });
  }
  /**
   *
   * @param {import("./types").UUIDv4} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const db = await this.storage;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(OfflineStorage.#store, "readwrite");
      const store = tx.objectStore(OfflineStorage.#store);
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`[OfflineStorage] ${tx.error}`));
    });
  }
}

export const storage = new OfflineStorage();
