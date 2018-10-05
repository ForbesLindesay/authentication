---
title: Secure Hash
---

Secure Hash provides a safe way to store and verify both user-supplied passwords, and auto-generated cryptographic tokens.

## Installation

To install, run the following command in your terminal:

```sh
yarn add @authentication/secure-hash
```

## Configuration

The recommended way of configuring secure-hash is using environment variables:

* `MINIMUM_HASH_TIME` (default: `1s`) - the minimum time it should take to hash a password. `HASH_OPS_LIMIT` and `HASH_MEM_LIMIT` are automatically increased if any password hashes take less than this amount of time. You cannot set this less than `500ms`. This automated adjustment will never reduce `HASH_OPS_LIMIT` or `HASH_MEM_LIMIT`.
* `HASH_OPS_LIMIT` (default: `20`) - The starting ops limit. This controlls how much CPU power is used. It is automatically increased if passwords are being hashed faster than `MINIMUM_HASH_TIME`.
* `HASH_MEM_LIMIT` (default: `50MB`) - The starting mem limit. This controlls how much memory is used. It is automatically increased if passwords are being hashed faster than `MINIMUM_HASH_TIME`.
* `HASH_PARALLEL_LIMIT` (default: `3`) - How many passwords can be hashed/verified at a time. This number is intentionally set fairly low, as password hashing is very resource intensive. If you set this number too high, it may be possible to case a "denial of service" by simply attempting to log in many times in parallel. If this is set low, at least the rest of your site should keep working.

## Usage

This example shows how you would build functions for "create user", "set password" and "check password". It is important to always rate limit any function that is used for checking a password. In addition to the userID based rate limit shown here, you may want to add an IP address based rate limit that covers all these functions.

The `verify` function takes a callback to update the password hash. This is so that the password hash can be made automatically harder to crack over time.

N.B. it is always a good idea to explicitly compare `await verify(password, passwordHash, onUpdate)` with `true`, e.g. `(await verify(password, passwordHash, onUpdate)) === true` rather than simply using `if (await verify(password, passwordHash, onUpdate))` because the comparision to `true` will fail in a safe way if you forget the `await` keyword, or if there are ever API changes in the future.

```typescript
import {ExponentialRateLimit, RateLimitState} from '@authentication/rate-limit';
import {hash, verify} from '@authentication/secure-hash';

// N.B. the data in these Maps would need to be stored in
//      a database in any real world application
const rateLimitStore = new Map<number, RateLimitState>();
const userPasswords = new Map<number, string>();

const rateLimit = new ExponentialRateLimit({
  async save(userID: number, state: RateLimitState) {
    rateLimitStore.set(userID, state);
  },
  async load(userID: number) {
    return rateLimitStore.get(userID) || null;
  },
  async remove(userID: number) {
    rateLimitStore.delete(userID);
  }
});

export async function createUser(userID: number, password: string) {
  const passwordHash = await hash(password);
  if (db.has(userID)) {
    throw new Error('A user with that ID already exists');
  }
  db.set(userID, passwordHash);
}
export async function setPassword(
  userID: number,
  newPassword: string,
  oldPassword: string
) {
  const passwordHash = await hash(newPassword);
  if ((await checkPassword(userID, oldPassword)) === true) {
    db.set(userID, passwordHash);
  } else {
    throw new Error('Incorrect password');
  }
}
export async function checkPassword(
  userID: number,
  password: string
): Promise<boolean> {
  await rateLimit.consume(userID);
  const passwordHash = db.get(userID);
  if (!passwordHash) {
    throw new Error('Could not find user');
  }
  const isPasswordCorrect = await verify(
    password,
    passwordHash,
    async updatedPasswordHash => {
      db.set(userID, updatedPasswordHash);
    }
  );
  if (isPasswordCorrect === true) {
    await rateLimit.reset(userID);
  }
  return isPasswordCorrect;
}
```

```javascript
const {ExponentialRateLimit} = require('@authentication/rate-limit');
const {hash, verify} = require('@authentication/secure-hash');

// N.B. the data in these Maps would need to be stored in
//      a database in any real world application
const rateLimitStore = new Map(); // {userID => RateLimitState}
const userPasswords = new Map(); // {userID => string}

const rateLimit = new ExponentialRateLimit({
  async save(userID, state) {
    rateLimitStore.set(userID, state);
  },
  async load(userID) {
    return rateLimitStore.get(userID) || null;
  },
  async remove(userID) {
    rateLimitStore.delete(userID);
  }
});

export async function createUser(userID, password) {
  const passwordHash = await hash(password);
  if (db.has(userID)) {
    throw new Error('A user with that ID already exists');
  }
  db.set(userID, passwordHash);
}
export async function setPassword(userID, newPassword, oldPassword) {
  const passwordHash = await hash(newPassword);
  if ((await checkPassword(userID, oldPassword)) === true) {
    db.set(userID, passwordHash);
  } else {
    throw new Error('Incorrect password');
  }
}
// returns Promise<boolean>
export async function checkPassword(userID, password) {
  await rateLimit.consume(userID);
  const passwordHash = db.get(userID);
  if (!passwordHash) {
    throw new Error('Could not find user');
  }
  const isPasswordCorrect = await verify(
    password,
    passwordHash,
    async updatedPasswordHash => {
      db.set(userID, updatedPasswordHash);
    }
  );
  if (isPasswordCorrect) {
    await rateLimit.reset(userID);
  }
  return isPasswordCorrect;
}
```
