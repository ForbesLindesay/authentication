---
title: Rate Limit
---

It is very important to set a rate limit for password attempts (and for things that look like passwords, such as password reset tokens you've sent out in an e-mail). It is also often important to rate limit API requests (either by API, user account ID or access token), to prevent abuse.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/rate-limit
```

## Usage

### ExponentialRateLimit - use this for password attempts

If you've ever forgotten your password on an iPhone, you will have experienced an exponential rate limit. These work well for passwords because they allow the first 2 or 3 attempts to happen in rapid succession, not penalising people who make a simple typo. They then slowly get more punishing, so that if someone remembers their password after a few seconds, and enters it as the 4th or 5th guess, they'll still not have had to wait very long. However, once you try and brute force an exponential rate limit, you can quickly find yourself waiting days between attempts.

```typescript
import {ExponentialRateLimit, RateLimitState} from '@authentication/rate-limit';

// N.B. it is generally a bad idea to store this
// state in memory, you should put in your database
// so it is persisted between server restarts.
const rateLimitStore = new Map<number, RateLimitState>();
const rateLimit = new ExponentialRateLimit(
  {
    async save(userID: number, state: RateLimitState) {
      rateLimitStore.set(userID, state);
    },
    async load(userID: number) {
      return rateLimitStore.get(userID) || null;
    },
    async remove(userID: number) {
      rateLimitStore.delete(userID);
    }
  },
  {
    /**
     * Number of milliseconds for first delay. Defaults to 1 second
     */
    baseDelay: '1 second',
    /**
     * Number to multiply delay by after each attempt. Defaults to 2
     */
    factor: 2,
    /**
     * Number of attempts to allow before rate limiting. Defaults to 1
     */
    freeAttempts: 1
  }
);

export default async function verifyPasswordWithRateLimit(
  userID: number,
  providedPassword: string,
  expectedPasswordHash: string
) {
  await rateLimit.consume(userID, {timeout: '1 minute'});
  if (await verifyPassword(providedPassword, expectedPasswordHash)) {
    rateLimit.reset(userID);
    return true;
  }
  return false;
}
```

```javascript
const {ExponentialRateLimit} = require('@authentication/rate-limit');

// N.B. it is generally a bad idea to store this
// state in memory, you should put in your database
// so it is persisted between server restarts.
const rateLimitStore = new Map(); // {userID => State}
const rateLimit = new ExponentialRateLimit(
  {
    async save(userID, state) {
      rateLimitStore.set(userID, state);
    },
    async load(userID) {
      return rateLimitStore.get(userID) || null;
    },
    async remove(userID) {
      rateLimitStore.delete(userID);
    }
  },
  {
    /**
     * Number of milliseconds for first delay. Defaults to 1 second
     */
    baseDelay: '1 second',
    /**
     * Number to multiply delay by after each attempt. Defaults to 2
     */
    factor: 2,
    /**
     * Number of attempts to allow before rate limiting. Defaults to 1
     */
    freeAttempts: 1
  }
);

export default async function verifyPasswordWithRateLimit(
  userID,
  providedPassword,
  expectedPasswordHash
) {
  await rateLimit.consume(userID, {timeout: '1 minute'});
  if (await verifyPassword(providedPassword, expectedPasswordHash)) {
    rateLimit.reset(userID);
    return true;
  }
  return false;
}
```

### BucketRateLimit - use this for API rate limits

Bucket rate limits are generally used for APIs. The best way to understand how this works is to imagine a physical bucket full of balls. Each time you make a request, you must take out a ball. Every time an interval elapses, a new ball is added to the bucket. If the bucket is empty, you must wait for a ball to be added, before you can make a request. If the bucket gets full, no more balls will be added until one has been removed.

```typescript
import {BucketRateLimit, RateLimitState} from '@authentication/rate-limit';

// N.B. it is generally a bad idea to store this
// state in memory, you should put in your database
// so it is persisted between server restarts.
const rateLimitStore = new Map<string, RateLimitState>();
const rateLimit = new BucketRateLimit(
  {
    async save(apiToken: string, state: RateLimitState) {
      rateLimitStore.set(apiToken, state);
    },
    async load(apiToken: string) {
      return rateLimitStore.get(apiToken) || null;
    },
    async remove(apiToken: string) {
      rateLimitStore.delete(apiToken);
    }
  },
  {
    /**
     * The number of milliseconds between requests once rate limiting begins.
     * Defaults to 1 second
     */
    interval: '1 second',
    /**
     * The maximum number of request tokens in the bucket. This is effectively
     * the starting number for how many tokens you can use. Defaults to 10
     */
    maxSize: 10
  }
);

export default async function makeExpensiveAPICallRateLimited(
  apiToken: number
) {
  await rateLimit.consume(apiToken, {timeout: '1 minute'});
  return await makeExpensiveAPICall(apiToken);
}
```

```javascript
const {BucketRateLimit} = require('@authentication/rate-limit');

// N.B. it is generally a bad idea to store this
// state in memory, you should put in your database
// so it is persisted between server restarts.
const rateLimitStore = new Map(); // {apiToken => State}
const rateLimit = new BucketRateLimit(
  {
    async save(apiToken, state) {
      rateLimitStore.set(apiToken, state);
    },
    async load(apiToken) {
      return rateLimitStore.get(apiToken) || null;
    },
    async remove(apiToken) {
      rateLimitStore.delete(apiToken);
    }
  },
  {
    /**
     * The number of milliseconds between requests once rate limiting begins.
     * Defaults to 1 second
     */
    interval: '1 second',
    /**
     * The maximum number of request tokens in the bucket. This is effectively
     * the starting number for how many tokens you can use. Defaults to 10
     */
    maxSize: 10
  }
);

export default async function makeExpensiveAPICallRateLimited(apiToken) {
  await rateLimit.consume(apiToken, {timeout: '1 minute'});
  return await makeExpensiveAPICall(apiToken);
}
```

## API

Both `ExponentialRateLimit` and `BucketRateLimit` have the same API, except for the options they accept as the second parameter to the constructor. They both take a `Store` as the first argument to their constructor.

### `Store`

The store is used to persist rate limit info to the database. The data stored is always an object of the form `{value: number, timestamp: number}`. These two numbers provide enough info to compute the entire state of the rate limit.

If your store is not transactional - only recommended for single-process deployment. You must pass an object implementing:

* `save(id: ID, state: State): Promise<any>` - a function that saves the `state` for the given `id`.
* `load(id: ID): Promise<State | null>` - a function that retrieves the `state` for the given `id` and returns `null` if no state was found with that `id`.
* `remove(id: ID): Promise<any>` - a function to remove the `state` at a given `id`.

The `ID`s can be either `string`s or `number`s, as long as you are consistent.

If you are planning to run your node application across multiple servers, you should use a store that supports transactions. You can do this by implementing just `tx<T>(fn: (store: Store) => Promise<T>): T`, where `Store` is an implementation of the non-transactional API above. You should:

1. start a transaction
2. call `fn` with an object implementing `save`, `load` and `remove`
3. wait for the promise returned by `fn`.
4. if `fn` threw an exception, revert the transaction and re-throw the exception.
5. if `fn` did not throw an exception, commit the transaction and return the result of `fn`.

### `RateLimit.consume(id, options)`

Consume one token from the rate limit specified by id. If consuming would take more than `options.timeout` milliseconds, a `RateLimitExceededError` is thrown, otherwise the appropriate time is waited.

Options:

* `timeout` (optional, `number | string`) - The maximum amount of time (in milliseconds) to wait for a token to become available. Defaults to 4 seconds.

### `RateLimit.getNextTime(id)`

Get the unix timestamp (in milliseconds) at which a token will next be available. Returns `Date.now()` if a token is already available. The return value is a `Promise` for a `number`.

### `RateLimit.reset(id)`

Reset the rate limit for a given `id`. You may want to do this after a successful password attempt (for example). If you are using an `ExponentialRateLimit` and never call this funciton, your rate limits will get steadily slower and slower.

### `isRateLimitExceededError(err)`

Returns `true` if an error is a `RateLimitExceededError`. Usage:

```typescript
import {isRateLimitExceededError} from '@authentication/rate-limit';

async function run() {
  try {
    rateLimit.consume(id);
  } catch (err) {
    if (isRateLimitExceededError(err)) {
      console.log('Try again at ' + new Date(err.nextTokenTimestamp));
      return;
    }
    throw err;
  }
  console.log('doing the thing');
}
```

```javascript
const {isRateLimitExceededError} = require('@authentication/rate-limit');

async function run() {
  try {
    rateLimit.consume(id);
  } catch (err) {
    if (isRateLimitExceededError(err)) {
      console.log('Try again at ' + new Date(err.nextTokenTimestamp));
      return;
    }
    throw err;
  }
  console.log('doing the thing');
}
```
