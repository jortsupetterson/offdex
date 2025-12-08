export class StorageQuery {
  constructor(args = {}) {
    this.args = args;
  }

  matches(object) {
    for (const key in this.args) {
      if (object[key] !== this.args[key]) return false;
    }
    return true;
  }
}
