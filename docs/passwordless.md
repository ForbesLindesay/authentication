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

Passwordless login requires a client side integration. This example uses `react-passwordless`, but you can always use that code as a guide to create your own client if you are not using React.

### Server

```typescript
import PasswordlessAuthentication from '@authentication/passwordless';
import getTransport from '@authentication/send-message';
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
// We also need to tell passwordless what the callback will be, used for
// the "Magic" link that lets people log in by just clicking the button.
const passwordlessAuthentication = new PasswordlessAuthentication<string>({
  callbackURL: '/__/auth/passwordless/callback',
  store: {
    async saveToken(token: Token<string>) {
      const tokenID = '' + nextTokenID++;
      tokens.set(tokenID, token);
      return tokenID;
    },
    async loadToken(tokenID: string) {
      return tokens.get(tokenID) || null;
    },
    async updateToken(tokenID: string, token: Token<string>) {
      tokens.set(tokenID, token);
    },
    async removeToken(tokenID: string) {
      tokens.delete(tokenID);
    },
    async saveRateLimit(id: string, state: RateLimitState) {
      rateLimit.set(id, state);
    },
    async loadRateLimit(id: string) {
      return rateLimit.get(id) || null;
    },
    async removeRateLimit(id: string) {
      rateLimit.delete(id);
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
      const result = await passwordlessAuthentication.createToken(
        req,
        res,
        userID,
        'Hello World'
      );
      if (result.created) {
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
      }
      res.json(result.status);
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
        passCode: req.body.passCode
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
app.get(passwordlessAuthentication.callbackPath, async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.verifyPassCode(req, res);
    if (result.verified) {
      const {userID, state} = result;
      res.json({userID, state});
    } else {
      const {status} = result;
      switch (status.kind) {
        case VerifyPassCodeStatusKind.ExpiredToken:
          res.redirect('/?err=EXPIRED_TOKEN');
          break;
        default:
          throw new Error(status.message);
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
const express = require('express');

const app = express();

// You should use a real database instead of these three
// lines.  You'll need one table to store `Token`s and another
// to store `RateLimitState`s
let nextTokenID = 0;
// map from string to Token<State>
const tokens = new Map();
// map from string to RateLimitState
const rateLimit = new Map();

// We need to tell passwordless how to store the single use passwords
// it generates, and the rate limit information (to stop one person)
// generating thousands of tokens.
// We also need to tell passwordless what the callback will be, used for
// the "Magic" link that lets people log in by just clicking the button.
const passwordlessAuthentication = new PasswordlessAuthentication({
  callbackURL: '/__/auth/passwordless/callback',
  store: {
    async saveToken(token) {
      const tokenID = '' + nextTokenID++;
      tokens.set(tokenID, token);
      return tokenID;
    },
    async loadToken(tokenID) {
      return tokens.get(tokenID) || null;
    },
    async updateToken(tokenID, token) {
      tokens.set(tokenID, token);
    },
    async removeToken(tokenID) {
      tokens.delete(tokenID);
    },
    async saveRateLimit(id, state) {
      rateLimit.set(id, state);
    },
    async loadRateLimit(id) {
      return rateLimit.get(id) || null;
    },
    async removeRateLimit(id) {
      rateLimit.delete(id);
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
      const result = await passwordlessAuthentication.createToken(
        req,
        res,
        userID,
        'Hello World'
      );
      if (result.created) {
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
      }
      res.json(result.status);
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
        passCode: req.body.passCode
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
app.get(passwordlessAuthentication.callbackPath, async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.verifyPassCode(req, res);
    if (result.verified) {
      const {userID, state} = result;
      console.log({userID, state});
      res.json({userID, state});
    } else {
      const {status} = result;
      switch (status.kind) {
        case VerifyPassCodeStatusKind.ExpiredToken:
          res.redirect('/?err=EXPIRED_TOKEN');
          break;
        default:
          throw new Error(status.message);
      }
    }
  } catch (ex) {
    next(ex);
  }
});

app.listen(3000);
```

### Client

If you want to override the look and feel of passwordless login (which you normally do) you can pass `renderEmailForm` and `renderPassCodeForm` as props.

```typescript
import Passwordless from '@authentication/react-passwordless';
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
    verifyPassCode={passCode =>
      request('POST', '/__/auth/passwordless/verify-pass-code', {
        json: {passCode}
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
    verifyPassCode={passCode =>
      request('POST', '/__/auth/passwordless/verify-pass-code', {
        json: {passCode}
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
