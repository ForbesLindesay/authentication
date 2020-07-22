---
title: Passwordless
---

This library provides local authentication for an e-mail address by sending the user a one-time-code. This is generally more secure than using a password because users tend to re-use passwords, and pick weak passwords.

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/passwordless
```

## Usage

Passwordless login requires a client side integration. This example uses `@authentication/react-passwordless`, but you can always use that code as a guide to create your own client if you are not using React.

### Server

```typescript
import PasswordlessAuthentication from '@authentication/passwordless';
import getTransport from '@authentication/send-message';
import getRequestURL from '@authentication/request-url';
import express = require('express');

const app = express();

// You should use a real database instead of these three
// lines.  You'll need one table to store `Token`s and another
// to store `RateLimitState`s
let nextTokenID = 0;
const tokens = new Map<string, Token<string>>();
const rateLimit = new Map<string, RateLimitState>();

// We need to tell passwordless how to store the single use passwords
// it generates, and the rate limit information (to stop one person)
// generating thousands of tokens.
const passwordlessAuthentication = new PasswordlessAuthentication<string>({
  store: {
    tokens: {
      async save(token: Token<string>) {
        const tokenID = '' + nextTokenID++;
        tokens.set(tokenID, token);
        return tokenID;
      },
      async load(tokenID: string) {
        return tokens.get(tokenID) || null;
      },
      async update(tokenID: string, token: Token<string>, oldToken: Token<string>) {
        const expectedOldToken = tokens.get(tokenID);
        if (
          !expectedOldToken ||
          expectedOldToken.version !== oldToken.version
        ) {
          throw new Error(
            'Rejecting multiple concurrent attempts to verify pass codes',
          );
        }
        tokens.set(tokenID, token);
      },
      async remove(tokenID: string) {
        tokens.delete(tokenID);
      }
    },
    rateLimit: {
      async save(id: string, state: RateLimitState) {
        rateLimit.set(id, state);
      },
      async load(id: string) {
        return rateLimit.get(id) || null;
      },
      async remove(id: string) {
        rateLimit.delete(id);
      }
    }
  }
});
// We need a way to send people the e-mails.  See:
// https://www.atauthentication.com/docs/send-message.html
const mailTransport = getTransport();

// The first step is for the client to call this API to create a token
// The state is then sent back to the user
// N.B. You must not send the magicLink or passCode anywhere **except** the e-mail.
app.post(
  '/__/auth/passwordless/create-token',
  json(),
  async (req, res, next) => {
    try {
      const userID = req.body.email;
      const result = await passwordlessAuthentication.createToken({
        // N.B. this will not be the correct IP address if we are
        // running behind a proxy, but since it is used for rate
        // limiting, the important thing is that it cannot be spoofed.
        ipAddress: req.connection.remoteAddress || 'unknown_ip',
        userID,
        state: 'Hello World',
        async sendTokenToUser({passCode, withCode}) {
          const magicLink = withCode(
            new URL(
              '/__/auth/passwordless/callback',
              // N.B. to keep this working when running
              // behind a proxy in production, you should
              // specify the baseURL explicitly, e.g. via
              // an enviornment variable.
              getRequestURL(req),
            ),
          );
          const {magicLink, passCode} = result;
          await mailTransport.sendMail({
            from: 'noreply@example.com',
            to: userID,
            subject: 'Confirm your e-mail',
            text:
              'Thank your for signing in to ' +
              magicLink.hostname +
              '. Please enter the following code into the box provided:\n\n  ' +
              passCode +
              '\n\nor click this "magic" link:\n\n  ' +
              magicLink.href,
            html: `
              <p>
                Thank your for signing in to
                <a href="${magicLink.href}">${magicLink.hostname}</a>.
                Please enter the following code into the box provided:
              </p>
              <p style="font-size: 40px; font-weight: bold; margin: 20px;">
                ${passCode}
              </p>
              <p>or click:</p>
              <a
                style="display:inline-block;background:blue;font-size:40px;font-weight:bold;margin:20px;padding:20px;border-radius:4px;color:white;text-decoration:none;"
                href="${magicLink.href}"
              >
                Magic Link
              </a>
            `
          });
        },
      });
      res.json(result);
    } catch (ex) {
      next(ex);
    }
  }
);

// If the user types in a pass code, it will call this API to complete the login process.
// You can store the resulting userID in the session, as well as sending the `status` back
// to the client to complete the loign
app.post(
  '/__/auth/passwordless/verify-pass-code',
  json(),
  async (req, res, next) => {
    try {
      const result = await passwordlessAuthentication.verifyPassCode(req, res, {
        tokenID: req.body.tokenID,
        passCode: req.body.passCode,
        ipAddress: req.connection.remoteAddress || 'unknown_ip',
      });
      if (result.verified) {
        const {userID, state} = result;
        console.log({userID, state});
      }
      res.json(result.status);
    } catch (ex) {
      next(ex);
    }
  }
);

// The callback handles the "magic" link. It logs the user in, and in a real app
// would then redirect the user to the home page/to where they were logging in to
app.get('/__/auth/passwordless/callback', async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.verifyPassCodeFromRequest(req, {
      ipAddress: req.connection.remoteAddress || 'unknown_ip',
    });
    if (result.verified) {
      const {userID, state} = result;
      res.json({userID, state});
    } else {
      const {status} = result;
      switch (status.kind) {
        case PasswordlessResponseKind.ExpiredToken:
          res.redirect('/?err=EXPIRED_TOKEN');
          break;
        case PasswordlessResponseKind.IncorrectPassCode:
          res.status(400).send('This pass code is not valid.');
          break;
        case PasswordlessResponseKind.RateLimitExceeded:
          res
            .status(400)
            .send(
              `You have made too many attempts. Wait ${
                (Date.now() - status.nextTokenTimestamp) / 1000
              } seconds before retrying.`,
            );
          break;
        default:
          throw new Error('Unexpected error');
      }
    }
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

```javascript
const PasswordlessAuthentication = require('@authentication/passwordless');
const getTransport = require('@authentication/send-message');
const getRequestURL = require('@authentication/request-url');
const express = require('express');

const app = express();

// You should use a real database instead of these three
// lines.  You'll need one table to store `Token`s and another
// to store `RateLimitState`s
let nextTokenID = 0;
const tokens = new Map();
const rateLimit = new Map();

// We need to tell passwordless how to store the single use passwords
// it generates, and the rate limit information (to stop one person)
// generating thousands of tokens.
const passwordlessAuthentication = new PasswordlessAuthentication{
  store: {
    tokens: {
      async save(token) {
        const tokenID = '' + nextTokenID++;
        tokens.set(tokenID, token);
        return tokenID;
      },
      async load(tokenID) {
        return tokens.get(tokenID) || null;
      },
      async update(tokenID, token) {
        const expectedOldToken = tokens.get(tokenID);
        if (
          !expectedOldToken ||
          expectedOldToken.version !== oldToken.version
        ) {
          throw new Error(
            'Rejecting multiple concurrent attempts to verify pass codes',
          );
        }
        tokens.set(tokenID, token);
      },
      async remove(tokenID) {
        tokens.delete(tokenID);
      }
    },
    rateLimit: {
      async save(id, state) {
        rateLimit.set(id, state);
      },
      async load(id) {
        return rateLimit.get(id) || null;
      },
      async remove(id) {
        rateLimit.delete(id);
      }
    }
  }
});
// We need a way to send people the e-mails.  See:
// https://www.atauthentication.com/docs/send-message.html
const mailTransport = getTransport();

// The first step is for the client to call this API to create a token
// The state is then sent back to the user
// N.B. You must not send the magicLink or passCode anywhere **except** the e-mail.
app.post(
  '/__/auth/passwordless/create-token',
  json(),
  async (req, res, next) => {
    try {
      const userID = req.body.email;
      const result = await passwordlessAuthentication.createToken({
        // N.B. this will not be the correct IP address if we are
        // running behind a proxy, but since it is used for rate
        // limiting, the important thing is that it cannot be spoofed.
        ipAddress: req.connection.remoteAddress || 'unknown_ip',
        userID,
        state: 'Hello World',
        async sendTokenToUser({passCode, withCode}) {
          const magicLink = withCode(
            new URL(
              '/__/auth/passwordless/callback',
              // N.B. to keep this working when running
              // behind a proxy in production, you should
              // specify the baseURL explicitly, e.g. via
              // an enviornment variable.
              getRequestURL(req),
            ),
          );
          const {magicLink, passCode} = result;
          await mailTransport.sendMail({
            from: 'noreply@example.com',
            to: userID,
            subject: 'Confirm your e-mail',
            text:
              'Thank your for signing in to ' +
              magicLink.hostname +
              '. Please enter the following code into the box provided:\n\n  ' +
              passCode +
              '\n\nor click this "magic" link:\n\n  ' +
              magicLink.href,
            html: `
              <p>
                Thank your for signing in to
                <a href="${magicLink.href}">${magicLink.hostname}</a>.
                Please enter the following code into the box provided:
              </p>
              <p style="font-size: 40px; font-weight: bold; margin: 20px;">
                ${passCode}
              </p>
              <p>or click:</p>
              <a
                style="display:inline-block;background:blue;font-size:40px;font-weight:bold;margin:20px;padding:20px;border-radius:4px;color:white;text-decoration:none;"
                href="${magicLink.href}"
              >
                Magic Link
              </a>
            `
          });
        },
      });
      res.json(result);
    } catch (ex) {
      next(ex);
    }
  }
);

// If the user types in a pass code, it will call this API to complete the login process.
// You can store the resulting userID in the session, as well as sending the `status` back
// to the client to complete the loign
app.post(
  '/__/auth/passwordless/verify-pass-code',
  json(),
  async (req, res, next) => {
    try {
      const result = await passwordlessAuthentication.verifyPassCode(req, res, {
        tokenID: req.body.tokenID,
        passCode: req.body.passCode,
        ipAddress: req.connection.remoteAddress || 'unknown_ip',
      });
      if (result.verified) {
        const {userID, state} = result;
        console.log({userID, state});
      }
      res.json(result.status);
    } catch (ex) {
      next(ex);
    }
  }
);

// The callback handles the "magic" link. It logs the user in, and in a real app
// would then redirect the user to the home page/to where they were logging in to
app.get('/__/auth/passwordless/callback', async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.verifyPassCodeFromRequest(req, {
      ipAddress: req.connection.remoteAddress || 'unknown_ip',
    });
    if (result.verified) {
      const {userID, state} = result;
      res.json({userID, state});
    } else {
      const {status} = result;
      switch (status.kind) {
        case PasswordlessResponseKind.ExpiredToken:
          res.redirect('/?err=EXPIRED_TOKEN');
          break;
        case PasswordlessResponseKind.IncorrectPassCode:
          res.status(400).send('This pass code is not valid.');
          break;
        case PasswordlessResponseKind.RateLimitExceeded:
          res
            .status(400)
            .send(
              `You have made too many attempts. Wait ${
                (Date.now() - status.nextTokenTimestamp) / 1000
              } seconds before retrying.`,
            );
          break;
        default:
          throw new Error('Unexpected error');
      }
    }
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

### Client

If you want to override the look and feel of passwordless login (which you normally do) you can use the state returned by the `usePasswordless` hook. For this example we just use the `DefaultForm` though, which offers a basic form with very little styling.

```typescript
import Passwordless from '@authentication/react-passwordless/DefaultForm';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import request from 'then-request';

const root = document.getElementById('root')!;

ReactDOM.render(
  <Passwordless
    createToken={email =>
      request('POST', '/__/auth/passwordless/create-token', {json: {email}})
        .getBody('utf8')
        .then(JSON.parse)
    }
    verifyPassCode={({passCode, tokenID}) =>
      request('POST', '/__/auth/passwordless/verify-pass-code', {
        json: {passCode, tokenID}
      })
        .getBody('utf8')
        .then(JSON.parse)
    }
    onPassCodeVerified={userID => alert('User ID: ' + userID)}
  />,
  root
);
```

```javascript
const Passwordless = require('@authentication/react-passwordless');
const React = require('react');
const ReactDOM = require('react-dom');
const request = require('then-request');

const root = document.getElementById('root');

ReactDOM.render(
  <Passwordless
    createToken={email =>
      request('POST', '/__/auth/passwordless/create-token', {json: {email}})
        .getBody('utf8')
        .then(JSON.parse)
    }
    verifyPassCode={({passCode, tokenID}) =>
      request('POST', '/__/auth/passwordless/verify-pass-code', {
        json: {passCode, tokenID}
      })
        .getBody('utf8')
        .then(JSON.parse)
    }
    onPassCodeVerified={userID => alert('User ID: ' + userID)}
  />,
  root
);
```

## API

TODO
