export class ObservableValue {
  /**
   * @param {any} value
   * @param {any} [fallback]
   */
  constructor(value, fallback = null) {
    this.value = value;
    this.fallback = fallback;
    /** @type {Set<{ event: "set" | "reset"; callback: (value: any) => void }>} */
    this.observers = new Set();
  }
  get() {
    return this.value;
  }
  /**
   * @param {any} newValue
   * @returns {void}
   */
  set(newValue) {
    if (newValue === this.value) return;
    this.value = newValue;
    const changeObservers = [...this.observers].filter(
      (observer) => observer.event === "set"
    );
    for (const observer of changeObservers) {
      observer.callback(newValue);
    }
  }
  reset() {
    this.value = this.fallback;
    const resetObservers = [...this.observers].filter(
      (observer) => observer.event === "reset"
    );
    for (const observer of resetObservers) {
      observer.callback(this.fallback);
    }
  }
  /**
   * @param {"set" | "reset"} event
   * @param {Function} callback
   * @returns {() => void}
   */
  observe(event, callback) {
    if (event !== "set" && event !== "reset")
      throw new Error(
        "{offdex} ObservableValue: Supported `event` parameters are [set, reset]"
      );
    if (typeof callback !== "function")
      throw new Error(
        "{offdex} ObservableValue: Paramater `callback` must be of type function"
      );
    const observer = { event, callback };
    this.observers.add(observer);
    return () => {
      this.observers.delete(observer);
    };
  }
}
