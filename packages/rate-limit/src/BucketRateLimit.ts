import BaseRateLimit, {RateLimitStore} from './BaseRateLimit';
import takeBucket, {
  BucketState,
  BucketOptions,
  ParsedOptions,
  parseBucketOptions,
} from './BucketRateLimitAlgorithm';

export {BucketState, BucketOptions};

export default class BucketRateLimit<
  ID extends string | number = string | number
> extends BaseRateLimit<ID> {
  private readonly _options: ParsedOptions;
  constructor(
    store: 'memory' | RateLimitStore<ID>,
    options: BucketOptions = {},
  ) {
    super(store);
    this._options = parseBucketOptions(options);
  }
  protected _take(state: null | BucketState, now: number) {
    return takeBucket(state, this._options, now);
  }
}
