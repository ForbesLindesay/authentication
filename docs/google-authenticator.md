---
title: Google Authenticator (2FA)
---

This library provides support for 2 factor authentication that is compatible with Google Authenticator.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/google-authenticator
```

## Usage

For each user, generate a secret and store it in the user's account. Do this as part of the setup process for the user.

```typescript
import {generateSecret} from '@authentication/google-authenticator';

async function add2FactorAuthentication(userID: number) {
  // get the secret to be shared with the google authenticator app
  const gaSecret = await generateSecret();
  await db.users.update(userID, {gaSecret});
}
```

```javascript
const {generateSecret} = require('@authentication/google-authenticator');

async function add2FactorAuthentication(userID) {
  // get the secret to be shared with the google authenticator app
  const gaSecret = await generateSecret();
  await db.users.update(userID, {gaSecret});
}
```

Then you need to show them an SVG of a QR code and the secret as a string (in case they are unable to scan the QR code). Only do this during setup/if the user has recently authenticated.

```typescript
import {getQRCodeSVG, getQRCodeURI} from '@authentication/google-authenticator';

async function render() {
  const svg = await getQRCodeSVG({
    secret: user.gaSecret,
    label: 'MyApp:user@example.com',
    issuer: 'MyApp'
  });
  const uri = getQRCodeURI({
    secret: user.gaSecret,
    label: 'MyApp:user@example.com',
    issuer: 'MyApp'
  });
  const html = `<img src="${uri}" /><p>${user.gaSecret}</p>`;
}
```

```javascript
const {
  getQRCodeSVG,
  getQRCodeURI
} = require('@authentication/google-authenticator');

async function render() {
  const svg = await getQRCodeSVG({
    secret: user.gaSecret,
    label: 'MyApp:user@example.com',
    issuer: 'MyApp'
  });
  const uri = getQRCodeURI({
    secret: user.gaSecret,
    label: 'MyApp:user@example.com',
    issuer: 'MyApp'
  });
  const html = `<img src="${uri}" /><p>${user.gaSecret}</p>`;
}
```

Verify the 6 digit token provided by the user:

```typescript
import {verifyToken} from '@authentication/google-authenticator';

function onToken(token: string) {
  if (verifyToken({secret: user.gaSecret, token}) === true) {
    // verified token
  }
}
```

```javascript
const {verifyToken} = require('@authentication/google-authenticator');

function onToken(token: string) {
  if (verifyToken({secret: user.gaSecret, token}) === true) {
    // verified token
  }
}
```

> N.B. You should rate limit attempts to verify tokens. I would recommend bucket based rate limiting by requester's IP address, and exponential rate limiting by user ID, that is reset on a successful login.
