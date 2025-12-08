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
          db.createObjectStore(ObjectStore.#store, { keyPath: "id" });
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
   * @param {import("../types").UUIDv4} id
   * @param {(propertyName: string, oldValue: any, newValue: any) => void | boolean} [onSetEvent]
   * @param {(propertyName: string, deletedValue: any) => void | boolean} [onDeleteEvent]
   * @returns {Promise<import("../types").StoredObject | undefined>}
   */
  async get(id, onSetEvent, onDeleteEvent) {
    const db = await this.instance;
    const objectStoreInstance = this;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readonly");
      const store = transaction.objectStore(ObjectStore.#store);
      const request = store.get(id);

      transaction.oncomplete = () => {
        if (!request.result) {
          resolve(undefined);
          return;
        }

        const target = request.result;

        const handler = {
          set(targetObject, propertyName, newValue) {
            const oldValue = targetObject[propertyName];
            if (onSetEvent) {
              const shouldUpdate = onSetEvent(propertyName, oldValue, newValue);
              if (shouldUpdate === false) return true;
            }
            targetObject[propertyName] = newValue;
            void objectStoreInstance.put(targetObject);
            return true;
          },
          deleteProperty(targetObject, propertyName) {
            const deletedValue = targetObject[propertyName];
            if (onDeleteEvent) {
              const shouldDelete = onDeleteEvent(propertyName, deletedValue);
              if (shouldDelete === false) return true;
            }
            delete targetObject[propertyName];
            void objectStoreInstance.put(targetObject);
            return true;
          },
        };

        resolve(new Proxy(target, handler));
      };

      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }

  /**
   * @param {import("../types").UUIDv4} id
   * @returns {Promise<void>}
   */
  async delete(id) {
    const db = await this.instance;
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(ObjectStore.#store, "readwrite");
      const store = transaction.objectStore(ObjectStore.#store);
      store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(new Error(`{offdex} ObjectStore: ${transaction.error}`));
    });
  }

  /**
   * @param {import("../StorageQuery/index.js").StorageQuery | ((object: import("../types").StoredObject) => boolean)} queryOrPredicate
   * @param {(propertyName: string, oldValue: any, newValue: any) => void | boolean} [onSetEvent]
   * @param {(propertyName: string, deletedValue: any) => void | boolean} [onDeleteEvent]
   * @returns {Promise<import("../types").StoredObject[]>}
   */
  async getAllMatches(queryOrPredicate, onSetEvent, onDeleteEvent) {
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
          const handler = {
            set(targetObject, propertyName, newValue) {
              const oldValue = targetObject[propertyName];
              if (onSetEvent) {
                const shouldUpdate = onSetEvent(
                  propertyName,
                  oldValue,
                  newValue
                );
                if (shouldUpdate === false) return true;
              }
              targetObject[propertyName] = newValue;
              void objectStoreInstance.put(targetObject);
              return true;
            },
            deleteProperty(targetObject, propertyName) {
              const deletedValue = targetObject[propertyName];
              if (onDeleteEvent) {
                const shouldDelete = onDeleteEvent(propertyName, deletedValue);
                if (shouldDelete === false) return true;
              }
              delete targetObject[propertyName];
              void objectStoreInstance.put(targetObject);
              return true;
            },
          };

          results.push(new Proxy(value, handler));
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
