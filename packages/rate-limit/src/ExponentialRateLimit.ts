/**
 * Exponential rate limiting is best for passwords.
 * Start with a small number of "free" attempts, then
 * start to delay an exponentially longer time. Every
 * time an attempt succeeds, reset the failed attempts
 * count to 0.
 */

import parseMs from './parseMs';
import BaseRateLimit, {Store} from './BaseRateLimit';

export interface ExponentialState {
  /**
   * The number of attempts made for this password
   */
  value: number;
  /**
   * The timestamp of the last attempt
   */
  timestamp: number;
}

export interface ExponentialOptions {
  /**
   * Number of milliseconds for first delay. Defaults to 1000
   */
  baseDelay?: number | string;
  /**
   * Number to multiply delay by after each attempt. Defaults to 2
   */
  factor?: number;
  /**
   * Number of attempts to allow before rate limiting. Defaults to 1
   */
  freeAttempts?: number;
}

function getDelay(attemptNumber: number, options: ExponentialOptions): number {
  const freeAttempts = options.freeAttempts || 1;
  if (attemptNumber < freeAttempts) {
    return 0;
  }
  const baseDelay = parseMs(options.baseDelay, 1000, 'options.baseDelay');
  return (
    baseDelay * Math.pow(options.factor || 2, attemptNumber - freeAttempts)
  );
}

function take(
  state: null | ExponentialState,
  options: ExponentialOptions,
  now: number,
): ExponentialState {
  if (!state) {
    return {value: 1, timestamp: now};
  }
  return {
    value: state.value + 1,
    timestamp: Math.max(state.timestamp + getDelay(state.value, options), now),
  };
}

export default class ExponentialRateLimit<
  ID extends string | number
> extends BaseRateLimit<ID> {
  private readonly _options: ExponentialOptions;
  constructor(store: Store<ID>, options: ExponentialOptions = {}) {
    super(store);
    this._options = options;
  }
  protected _take(state: null | ExponentialState, now: number) {
    return take(state, this._options, now);
  }
}
