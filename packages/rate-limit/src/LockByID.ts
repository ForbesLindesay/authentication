import Queue from './Queue';

type Q = (q: Queue<Q>) => void;

export default class LockByID {
  private readonly entries = new Map<string | number, Queue<Q>>();

  private waitInQueue(key: string | number): Promise<Queue<Q>> {
    const queue = this.entries.get(key);
    if (queue) {
      return new Promise<Queue<Q>>(resolve => queue.push(resolve));
    } else {
      const queue = new Queue<Q>();
      this.entries.set(key, queue);
      return Promise.resolve(queue);
    }
  }
  public async withLock<T>(
    key: string | number,
    fn: () => Promise<T>,
  ): Promise<T> {
    const queue = await this.waitInQueue(key);
    try {
      return await fn();
    } finally {
      const next = queue.shift();
      if (next) {
        next(queue);
      } else {
        this.entries.delete(key);
      }
    }
  }
}
