export default class Queue<T> {
  private s1: void | T[];
  private s2: void | T[];
  push(value: T) {
    if (!this.s1) {
      this.s1 = [];
    }
    this.s1.push(value);
  }
  shift(): T | void {
    if (!this.s2 || this.s2.length === 0) {
      if (!this.s1 || this.s1.length === 0) {
        return;
      }
      [this.s1, this.s2] = [this.s2, this.s1.reverse()];
    }
    return this.s2.pop();
  }
  isEmpty(): boolean {
    return !!(
      this.s1 &&
      this.s1.length === 0 &&
      this.s2 &&
      this.s2.length === 0
    );
  }
}
