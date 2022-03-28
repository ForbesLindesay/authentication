import takeBucket, {
  updateBucketState,
  BucketOptions,
  BucketState,
  parseBucketOptions,
} from './BucketRateLimitAlgorithm';

export {BucketOptions, BucketState};

export function update(
  state: null | BucketState,
  options: BucketOptions,
  now?: number,
) {
  return updateBucketState(
    state,
    parseBucketOptions(options),
    now === undefined ? Date.now() : now,
  );
}

export default function take(
  state: null | BucketState,
  options: BucketOptions,
  now?: number,
) {
  return takeBucket(
    state,
    parseBucketOptions(options),
    now === undefined ? Date.now() : now,
  );
}

module.exports = take;
module.exports.default = take;
module.exports.update = update;
