/**
 * Bucket rate limiting is best for APIs. Define a minimum interval
 * between requests once rate limiting has begun, and a starting
 * bucket size to allow for some bursts, providing that in the long
 * run there is no more than one request per `interval`.
 */

import parseMs from './parseMs';
import parseInteger from './parseInteger';

export interface BucketState {
  /**
   * The number of tokens remaining
   */
  value: number;
  /**
   * The timestamp at which the tokenCount was last updated
   */
  timestamp: number;
}
export interface BucketOptions {
  /**
   * The number of milliseconds between requests once rate limiting begins.
   * Defaults to 1000
   */
  interval?: number | string;
  /**
   * The maximum number of request tokens in the bucket. This is effectively
   * the starting number for how many tokens you can use.
   * Defaults to 10
   */
  maxSize?: number;
}
export interface ParsedOptions {
  interval: number;
  maxSize: number;
}
export function parseBucketOptions(options: BucketOptions = {}): ParsedOptions {
  const interval = parseMs(options.interval, 1000, 'options.interval');
  const maxSize = parseInteger(options.maxSize, 10, 'options.maxSize', 1);
  return {interval, maxSize};
}
export function updateBucketState(
  state: null | BucketState,
  {interval, maxSize}: ParsedOptions,
  now: number,
) {
  if (!state) {
    return {
      value: maxSize,
      timestamp: now,
    };
  }
  let {value, timestamp} = state;
  const increase = Math.floor((now - timestamp) / interval);
  value = Math.min(value + increase, maxSize);
  timestamp = value < maxSize ? timestamp + interval * increase : now;
  return {value, timestamp};
}
export default function takeBucket(
  state: null | BucketState,
  options: ParsedOptions,
  now: number,
): BucketState {
  const {value, timestamp} = updateBucketState(state, options, now);
  if (value > 0 && now >= timestamp) {
    // if there is a token available and the timestamp is in the past
    // take the token and leave the timestamp un-changed
    return {value: value - 1, timestamp};
  }
  // update the timestamp to a time when a token will be available, leaving
  // the token count at 0
  return {value, timestamp: timestamp + options.interval};
}
