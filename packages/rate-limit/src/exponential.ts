// @public

import takeExponential, {
  ExponentialOptions,
  ExponentialState,
  parseExponentialOptions,
} from './ExponentialRateLimitAlgorithm';

export {ExponentialOptions, ExponentialState};

export default function take(
  state: null | ExponentialState,
  options: ExponentialOptions,
  now?: number,
) {
  return takeExponential(
    state,
    parseExponentialOptions(options),
    now === undefined ? Date.now() : now,
  );
}

module.exports = take;
module.exports.default = take;
