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
// state in memory, you should put it in your database
// so it is persisted between server restarts.

const rateLimit = new ExponentialRateLimit('memory', {
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
  freeAttempts: 1,
});

export default async function verifyPasswordWithRateLimit(
  userID: number,
  providedPassword: string,
  expectedPasswordHash: string,
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
const rateLimit = new ExponentialRateLimit('memory', {
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
  freeAttempts: 1,
});

export default async function verifyPasswordWithRateLimit(
  userID,
  providedPassword,
  expectedPasswordHash,
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
const rateLimit = new BucketRateLimit('memory', {
  /**
   * The number of milliseconds between requests once rate limiting begins.
   * Defaults to 1 second
   */
  interval: '1 second',
  /**
   * The maximum number of request tokens in the bucket. This is effectively
   * the starting number for how many tokens you can use. Defaults to 10
   */
  maxSize: 10,
});

export default async function makeExpensiveAPICallRateLimited(
  apiToken: number,
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
const rateLimit = new BucketRateLimit('memory', {
  /**
   * The number of milliseconds between requests once rate limiting begins.
   * Defaults to 1 second
   */
  interval: '1 second',
  /**
   * The maximum number of request tokens in the bucket. This is effectively
   * the starting number for how many tokens you can use. Defaults to 10
   */
  maxSize: 10,
});

export default async function makeExpensiveAPICallRateLimited(apiToken) {
  await rateLimit.consume(apiToken, {timeout: '1 minute'});
  return await makeExpensiveAPICall(apiToken);
}
```

## Usage Without a Store

If you don't want to use the `Store` API that's included with this rate-limit package, you can always import the underlying algorithms. This may be useful for highly custom rate limiting scenarios.

### Exponential Rate Limit

With Exponential Rate Limit, the number of attempts and timestamp will just keep going up and up. You can discard the state and start again with `null` when you need to reset the rate limit.

```typescript
import take from '@authentication/rate-limit/exponential';

const options = {
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
  freeAttempts: 1,
};

let state = take(null, options);
// state will have the default state of 1 attempt and now as timestamp
state = take(state, options);
state = take(state, options);
state = take(state, options);
// timestamp represents the time (in ms) at which it will be ok to have taken this many actions
```

```javascript
const take = require('@authentication/rate-limit/exponential');

const options = {
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
  freeAttempts: 1,
};

let state = take(null, options);
// state will have the default state of 1 attempt and now as timestamp
state = take(state, options);
state = take(state, options);
state = take(state, options);
// timestamp represents the time (in ms) at which it will be ok to have taken this many actions
```

### Bucket Rate Limit

The bucket rate limit will continually return the same timestamp as the first time you took a token, until you empty the bucket's maxSize at which point it will start returning a timestamp in the future.

```typescript
import take, {update} from '@authentication/rate-limit/bucket';

const options = {
  /**
   * The number of milliseconds between requests once rate limiting begins.
   * Defaults to 1 second
   */
  interval: '1 second',
  /**
   * The maximum number of request tokens in the bucket. This is effectively
   * the starting number for how many tokens you can use. Defaults to 10
   */
  maxSize: 2,
};

let state = take(null, options);
// state will have the default state of 1 attempt and now as timestamp
state = take(state, options);
state = take(state, options);
state = take(state, options);
// timestamp represents the time (in ms) at which it will be ok to have taken this many actions

setTimeout(() => {
  state = update(state, options);
  // updates the state to the normalized form
}, 60_000);
```

```javascript
const take = require('@authentication/rate-limit/bucket');
const {update} = require('@authentication/rate-limit/bucket');

const options = {
  /**
   * The number of milliseconds between requests once rate limiting begins.
   * Defaults to 1 second
   */
  interval: '1 second',
  /**
   * The maximum number of request tokens in the bucket. This is effectively
   * the starting number for how many tokens you can use. Defaults to 10
   */
  maxSize: 2,
};

let state = take(null, options);
state = take(state, options);
state = take(state, options);
state = take(state, options);
// timestamp represents the time (in ms) at which it will be ok to have taken this many actions

setTimeout(() => {
  state = update(state, options);
  // updates the state to the normalized form
}, 60_000);
```

## API

Both `ExponentialRateLimit` and `BucketRateLimit` have the same API, except for the options they accept as the second parameter to the constructor. They both take a `Store` as the first argument to their constructor.

### `Store`

The store is used to persist rate limit info to the database. The data stored is always an object of the form `{value: number, timestamp: number}`. These two numbers provide enough info to compute the entire state of the rate limit.

> If you have multiple processes, you will need to ensure your store handles concurrency correctly. In transactional stores, you can do this by ensuring strong consistency via database transactions. In non-transactional stores you can use optimistic concurrency by checking the value of `oldState` in the `save` function matches what you have stored and throwing an error if it does not. You do not need to worry about this if you only have a single process.

#### Non Transactional Store

If your store is not transactional, You must pass an object implementing:

- `save(id: ID, state: State, oldState: null | State): Promise<any>` - a function that saves the `state` for the given `id`.
- `load(id: ID): Promise<State | null>` - a function that retrieves the `state` for the given `id` and returns `null` if no state was found with that `id`.
- `remove(id: ID): Promise<any>` - a function to remove the `state` at a given `id`.

The `ID`s can be either `string`s or `number`s, as long as you are consistent.

An example using [@databases/pg](https://www.atdatabases.org/docs/pg) might look like:

```typescript
import connect, {sql} from '@databases/pg';

const db = connect();

const rateLimit = new BucketRateLimit<string>({
  save: async (id, {value, timestamp}, oldState) => {
    if (!oldState) {
      await db.query(sql`
        INSERT INTO rate_limit_test.rate_limit (id, value, timestamp)
        VALUES (${id}, ${value}, ${timestamp});
      `);
    } else {
      const rows = await db.query(sql`
        UPDATE rate_limit_test.rate_limit
        SET value=${value}, timestamp=${timestamp}
        WHERE value=${oldState.value} AND timestamp=${oldState.timestamp}
        RETURNING id;
      `);
      if (rows.length !== 1) {
        throw new Error('State in db was different from expected old state');
      }
    }
  },
  load: async id => {
    const results = await db.query(sql`
      SELECT value, timestamp FROM rate_limit WHERE id=${id}
    `);
    if (results.length) {
      return results[0];
    } else {
      return null;
    }
  },
  remove: async id => {
    await db.query(sql`
      DELETE FROM rate_limit WHERE id=${id}
    `);
  },
});
```

```javascript
const connect = require('@databases/pg');
const {sql} = require('@databases/pg');

const db = connect();

const rateLimit = new BucketRateLimit({
  save: async (id, {value, timestamp}, oldState) => {
    if (!oldState) {
      await db.query(sql`
        INSERT INTO rate_limit_test.rate_limit (id, value, timestamp)
        VALUES (${id}, ${value}, ${timestamp});
      `);
    } else {
      const rows = await db.query(sql`
        UPDATE rate_limit_test.rate_limit
        SET value=${value}, timestamp=${timestamp}
        WHERE value=${oldState.value} AND timestamp=${oldState.timestamp}
        RETURNING id;
      `);
      if (rows.length !== 1) {
        throw new Error('State in db was different from expected old state');
      }
    }
  },
  load: async id => {
    const results = await db.query(sql`
      SELECT value, timestamp FROM rate_limit WHERE id=${id}
    `);
    if (results.length) {
      return results[0];
    } else {
      return null;
    }
  },
  remove: async id => {
    await db.query(sql`
      DELETE FROM rate_limit WHERE id=${id}
    `);
  },
});
```

To make this work, you'll need a table like:

```sql
CREATE TABLE rate_limit (
  id TEXT NOT NULL PRIMARY KEY,
  value INT NOT NULL
  timestamp BIGINT NOT NULL
);
```

#### Transactional Store

If you are using a store that supports transactions, you can use them by implementing just `tx<T>(fn: (store: Store) => Promise<T>): T`, where `Store` is an implementation of the non-transactional API above. You should:

1. start a transaction
2. call `fn` with an object implementing `save`, `load` and `remove`
3. wait for the promise returned by `fn`.
4. if `fn` threw an exception, revert the transaction and re-throw the exception.
5. if `fn` did not throw an exception, commit the transaction and return the result of `fn`.

An example using [@databases/pg](https://www.atdatabases.org/docs/pg) might look like:

```typescript
import connect, {sql} from '@databases/pg';

const db = connect();

const rateLimit = new BucketRateLimit<string>({
  async tx(fn) {
    return await db.tx(async tx => {
      return await fn({
        save: async (id, state) => {
          await db.query(sql`
            INSERT INTO rate_limit (id, state)
            VALUES (${id}, ${state})
            ON CONFLICT id
            DO UPDATE SET state = EXCLUDED.state;
          `);
        },
        load: async id => {
          const results = await db.query(sql`
            SELECT state FROM rate_limit WHERE id=${id}
          `);
          if (results.length) {
            return results[0].state;
          } else {
            return null;
          }
        },
        remove: async id => {
          await db.query(sql`
            DELETE FROM rate_limit WHERE id=${id}
          `);
        },
      });
    });
  },
});
```

```javascript
const connect = require('@databases/pg');
const {sql} = require('@databases/pg');

const db = connect();

const rateLimit = new BucketRateLimit({
  async tx(fn) {
    return await db.tx(async tx => {
      return await fn({
        save: async (id, state) => {
          await db.query(sql`
            INSERT INTO rate_limit (id, state)
            VALUES (${id}, ${state})
            ON CONFLICT id
            DO UPDATE SET state = EXCLUDED.state;
          `);
        },
        load: async id => {
          const results = await db.query(sql`
            SELECT state FROM rate_limit WHERE id=${id}
          `);
          if (results.length) {
            return results[0].state;
          } else {
            return null;
          }
        },
        remove: async id => {
          await db.query(sql`
            DELETE FROM rate_limit WHERE id=${id}
          `);
        },
      });
    });
  },
});
```

To make this work, you'll need a table like:

```sql
CREATE TABLE rate_limit (
  id TEXT NOT NULL PRIMARY KEY,
  state JSONB NOT NULL
);
```

### `RateLimit.consume(id, options)`

Consume one token from the rate limit specified by id. If consuming would take more than `options.timeout` milliseconds, a `RateLimitExceededError` is thrown, otherwise the appropriate time is waited.

Options:

- `timeout` (optional, `number | string`) - The maximum amount of time (in milliseconds) to wait for a token to become available. Defaults to 4 seconds.

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
