import LockByID from '@authentication/lock-by-id';
import parseMs from './parseMs';
import RateLimit, {ConsumeOptions} from './RateLimit';

export interface RateLimitState {
  value: number;
  timestamp: number;
}
export {ConsumeOptions};

export interface RateLimitStore<ID> {
  save(
    id: ID,
    state: RateLimitState,
    oldState: RateLimitState | null,
  ): Promise<void | null | {}>;
  load(id: ID): Promise<null | RateLimitState>;
  remove(id: ID): Promise<void | null | {}>;
}

export interface RateLimitExceededError {
  code: 'RATE_LIMIT_EXCEEDED';
  message: string;
  nextTokenTimestamp: number;
}
export function isRateLimitExceededError(
  err: any,
): err is RateLimitExceededError {
  return err && typeof err === 'object' && err.code === 'RATE_LIMIT_EXCEEDED';
}

class MemoryStore implements RateLimitStore<string | number> {
  private _map = new Map<string | number, RateLimitState>();
  async save(
    id: string | number,
    state: RateLimitState,
    oldState: RateLimitState,
  ) {
    const currentState = this._map.get(id);
    if (
      currentState?.timestamp !== oldState.timestamp ||
      currentState?.value !== oldState.value
    ) {
      throw new Error('Concurrent saves are not allowed');
    }
    this._map.set(id, state);
  }
  async load(id: string | number): Promise<null | RateLimitState> {
    return this._map.get(id) || null;
  }
  async remove(id: string | number) {
    this._map.delete(id);
  }
}
export default abstract class BaseRateLimit<
  ID extends string | number = string | number
> implements RateLimit<ID> {
  private readonly _store: RateLimitStore<ID>;
  private readonly _lock = new LockByID();
  protected abstract _take(
    state: null | RateLimitState,
    now: number,
  ): RateLimitState;
  constructor(store: 'memory' | RateLimitStore<ID>) {
    this._store = store === 'memory' ? new MemoryStore() : store;
  }
  private _tx<T>(
    id: ID,
    fn: (store: RateLimitStore<ID>) => Promise<T>,
  ): Promise<T> {
    return this._lock.withLock(id, () => {
      return fn(this._store);
    });
  }

  /**
   * Consume one from the rate limit specified by id.
   * If consuming would take more than `options.timeout` milliseconds,
   * a `RateLimitExceededError` is thrown.
   */
  async consume(id: ID, options: ConsumeOptions = {}) {
    const result = await this.tryConsume(id, options);
    if (!result.consumed) {
      const {message, nextTokenTimestamp} = result;
      const err: RateLimitExceededError = new Error(message) as any;
      err.code = 'RATE_LIMIT_EXCEEDED';
      err.nextTokenTimestamp = nextTokenTimestamp;
      throw err;
    }
  }

  /**
   * Consume one from the rate limit specified by id.
   * If consuming would take more than `options.timeout` milliseconds,
   * a `RateLimitExceededError` is thrown.
   */
  private async _tryConsume(id: ID, options: ConsumeOptions = {}) {
    const timeout = parseMs(options.timeout, 4000, 'options.timeout');
    const {delay, nextTokenTimestamp} = await this._tx(id, async (store) => {
      const now = Date.now();
      const oldState = await store.load(id);
      const newState = this._take(oldState, now);
      const delay = Math.max(newState.timestamp - now, 0);
      if (delay <= timeout) {
        await store.save(id, newState, oldState);
      }
      return {
        delay,
        nextTokenTimestamp: newState.timestamp,
      };
    });
    if (delay > timeout) {
      return {
        consumed: false,
        message: 'Rate limit exceeded, next token available in ' + delay + 'ms',
        delay,
        nextTokenTimestamp,
        map() {
          return this;
        },
      } as const;
    }
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
    return {
      consumed: true,
      map<T>(fn: () => T) {
        return fn();
      },
    } as const;
  }
  tryConsume(id: ID, options: ConsumeOptions = {}) {
    return this._tryConsume(id, options);
  }

  /**
   * Get the timestamp at which a request will next be accepted
   */
  async getNextTime(id: ID): Promise<number> {
    const now = Date.now();
    const oldState = await this._store.load(id);
    const newState = this._take(oldState, now);
    return newState.timestamp;
  }

  /**
   * Reset the rate limit for a given ID. You might want to do this
   * after a successful password attempt (for example).
   */
  reset(id: ID) {
    return this._tx(id, (store) => store.remove(id));
  }
}
