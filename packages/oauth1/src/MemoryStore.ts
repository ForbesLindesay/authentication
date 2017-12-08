import TokenStore from './TokenStore';

const THIRTY_MINUTES = 30 * 60 * 1000;
export default class MemoryStore implements TokenStore<number> {
  /**
   * We use a generational system to dispose of any keys older than 1 hour.
   * We do potentially keep keys for longer than 1 hour though. This means
   * we can avoid having individual timers for each key.
   */
  private evenGeneration = new Map<number, string>();
  private oddGeneration = new Map<number, string>();
  private lastTransition = Date.now();
  private isEven = true;
  private nextEvenID = 0;
  private nextOddID = 1;

  private garbageCollect() {
    const now = Date.now();
    if (now - this.lastTransition > THIRTY_MINUTES) {
      this.lastTransition = now;
      if (this.isEven) {
        this.oddGeneration.clear();
        this.isEven = false;
      } else {
        this.evenGeneration.clear();
        this.isEven = true;
      }
    }
  }
  retrieve(id: number): string | null {
    this.garbageCollect();
    if (id % 2 === 0) {
      return this.evenGeneration.get(id) || null;
    } else {
      return this.oddGeneration.get(id) || null;
    }
  }
  save(key: string): number {
    this.garbageCollect();
    if (this.isEven) {
      const id = this.nextEvenID;
      this.nextEvenID += 2;
      if (this.nextEvenID > Number.MAX_SAFE_INTEGER - 4) {
        this.nextEvenID = 0;
      }
      this.evenGeneration.set(id, key);
      return id;
    } else {
      const id = this.nextOddID;
      this.nextOddID += 2;
      if (this.nextOddID > Number.MAX_SAFE_INTEGER - 4) {
        this.nextOddID = 1;
      }
      this.oddGeneration.set(id, key);
      return id;
    }
  }
  remove(id: number): void {
    if (id % 2 === 0) {
      this.evenGeneration.delete(id);
    } else {
      this.oddGeneration.delete(id);
    }
  }
}
