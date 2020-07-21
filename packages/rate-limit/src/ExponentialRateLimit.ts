import BaseRateLimit, {RateLimitStore} from './BaseRateLimit';
import takeExponential, {
  ExponentialState,
  ExponentialOptions,
  ParsedOptions,
  parseExponentialOptions,
} from './ExponentialRateLimitAlgorithm';

export {ExponentialState, ExponentialOptions};

export default class ExponentialRateLimit<
  ID extends string | number = string | number
> extends BaseRateLimit<ID> {
  private readonly _options: ParsedOptions;
  constructor(
    store: 'memory' | RateLimitStore<ID>,
    options: ExponentialOptions = {},
  ) {
    super(store);
    this._options = parseExponentialOptions(options);
  }
  protected _take(state: null | ExponentialState, now: number) {
    return takeExponential(state, this._options, now);
  }
}
