export interface ConsumeOptions {
  timeout?: number | string;
}

export interface SuccessfulConsume {
  consumed: true;
  map<T>(fn: () => T): T;
}
export interface FailedConsume {
  consumed: false;
  message: string;
  delay: number;
  nextTokenTimestamp: number;
  map(fn: () => unknown): this;
}
export default interface BaseRateLimit<ID extends string | number> {
  /**
   * Consume one from the rate limit specified by id.
   * If consuming would take more than `options.timeout` milliseconds,
   * a `RateLimitExceededError` is thrown.
   */
  consume(id: ID, options?: ConsumeOptions): Promise<void>;
  /**
   * Consume one from the rate limit specified by id.
   */
  tryConsume(
    id: ID,
    options?: ConsumeOptions,
  ): Promise<SuccessfulConsume | FailedConsume>;
  /**
   * Get the timestamp at which a request will next be accepted
   */
  getNextTime(id: ID): Promise<number>;
  /**
   * Reset the rate limit for a given ID. You might want to do this
   * after a successful password attempt (for example).
   */
  reset(id: ID): Promise<void | null | {}>;
}
