import { ObservableValue } from "../ObservableValue/index.js";

export class ObservableObject {
  /**
   * @param {import("../types").StoredObject} object
   */
  constructor(object) {
    for (const key in object) {
      this[key] = new ObservableValue(object[key]);
    }
  }
}
