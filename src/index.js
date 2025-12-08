import { ObjectStore } from "./ObjectStore/index.js";
import { StorageQuery } from "./StorageQuery/index.js";
import { ObservableValue } from "./ObservableValue/index.js";
import { ObservableObject } from "./ObservableObject/index.js";

export { ObjectStore, StorageQuery, ObservableValue, ObservableObject };
export const storage = new ObjectStore();
