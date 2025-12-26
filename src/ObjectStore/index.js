export class ObjectStore {
  static #idb = "offdex";
  static #store = "objects";

  /**
   * @returns {Promise<IDBDatabase>}
   */
  static #open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(ObjectStore.#idb);

      request.addEventListener("upgradeneeded", () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(ObjectStore.#store)) {
          db.createObjectStore(ObjectStore.#store, { keyPath: "key" });
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
    this.instance = ObjectStore.#open();
  }

  /**
   * @param {import("../types").StoredObject} object
   * @returns {Promise<void>}
   */
  async put(object) {
    const db = await this.instance;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readwrite");
      const store = transaction.objectStore(ObjectStore.#store);
      store.put(object);

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }

  /**
   * @param {string} key
   * @returns {Promise<import("../types").StoredObject | undefined>}
   */
  async get(key) {
    const db = await this.instance;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readonly");
      const store = transaction.objectStore(ObjectStore.#store);
      const request = store.get(key);

      transaction.oncomplete = () => {
        if (!request.result) {
          resolve(undefined);
          return;
        }

        resolve(request.result);
      };

      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }

  /**
   * @param {string} key
   * @returns {Promise<void>}
   */
  async delete(key) {
    const db = await this.instance;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readwrite");
      const store = transaction.objectStore(ObjectStore.#store);
      store.delete(key);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }

  /**
   * @param {import("../types").StoredObject[]} objects
   * @returns {Promise<void>}
   */
  async putAll(objects) {
    const db = await this.instance;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readwrite");
      const store = transaction.objectStore(ObjectStore.#store);

      for (const object of objects) {
        store.put(object);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore.putAll: ${transaction.error}`));
    });
  }

  /**
   * @param {import("../StorageQuery/index.js").StorageQuery | ((object: import("../types").StoredObject) => boolean)} queryOrPredicate
   * @returns {Promise<import("../types").StoredObject[]>}
   */
  async getAllMatches(queryOrPredicate) {
    const db = await this.instance;
    const objectStoreInstance = this;

    const predicate =
      typeof queryOrPredicate === "function"
        ? queryOrPredicate
        : (object) => queryOrPredicate.matches(object);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readonly");
      const store = transaction.objectStore(ObjectStore.#store);
      const request = store.openCursor();

      const results = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;

        const value = cursor.value;

        if (predicate(value)) {
          results.push(value);
        }

        cursor.continue();
      };

      transaction.oncomplete = () => resolve(results);
      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }

  /**
   * @param {import("../StorageQuery/index.js").StorageQuery | ((object: import("../types").StoredObject) => boolean)} queryOrPredicate
   * @returns {Promise<void>}
   */
  async deleteAllMatches(queryOrPredicate) {
    const db = await this.instance;

    const predicate =
      typeof queryOrPredicate === "function"
        ? queryOrPredicate
        : (object) => queryOrPredicate.matches(object);

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readwrite");
      const store = transaction.objectStore(ObjectStore.#store);
      const request = store.openCursor();

      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) return;

        if (predicate(cursor.value)) {
          cursor.delete();
        }

        cursor.continue();
      };

      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }
}
