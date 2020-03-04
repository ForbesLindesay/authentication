/**
 * Exponential rate limiting is best for passwords.
 * Start with a small number of "free" attempts, then
 * start to delay an exponentially longer time. Every
 * time an attempt succeeds, reset the failed attempts
 * count to 0.
 */

import parseMs from './parseMs';
import parseInteger from './parseInteger';
import parseNumber from './parseNumber';

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

export interface ParsedOptions {
  baseDelay: number;
  factor: number;
  freeAttempts: number;
}

export function parseExponentialOptions(
  options: ExponentialOptions = {},
): ParsedOptions {
  const baseDelay = parseMs(options.baseDelay, 1000, 'options.baseDelay');
  const factor = parseNumber(options.factor, 2, 'options.factor', 1);
  const freeAttempts = parseInteger(
    options.freeAttempts,
    1,
    'options.freeAttempts',
    0,
  );
  return {baseDelay, factor, freeAttempts};
}

function getDelay(
  attemptNumber: number,
  {freeAttempts, baseDelay, factor}: ParsedOptions,
): number {
  if (attemptNumber < freeAttempts) {
    return 0;
  }
  return baseDelay * Math.pow(factor, attemptNumber - freeAttempts);
}

export default function takeExponential(
  state: null | ExponentialState,
  options: ParsedOptions,
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
