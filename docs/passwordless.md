---
title: Passwordless
---

This library provides local authentication for an e-mail address by sending the user a one-time-code. This is generally more secure than using a password because users tend to re-use passwords, and pick weak passwords.

> This library is under development, and these docs are not yet finished!!!

## Installation

To install, run the following command in your terminal:

```
yarn add @authentication/passwordless
```

## Usage

You'll want to create a few forms:

1. A form to enter your e-mail address
2. A form to enter the one-time pass code

This example uses simple forms, but you would probably want to use AJAX/Fetch to create a better experience for the user.

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

app.get('/', (req, res, next) => {
  res.send(
    `
      <form action="/__/auth/passwordless/create-token">
        ${
          req.query.err === 'INVALID_EMAIL'
            ? `<p style="color: red">Please check you have entered a valid e-mail</p>`
            : req.query.err === 'EXPIRED_TOKEN'
              ? `<p style="color: red">This token has expired, please enter your e-mail and try again.</p>`
              : ``
        }
        <label>
          Email:
          <input type="email" name="email" value="${req.query.email || ''}">
        </label>
        <button type="submit">Login</button>
      </form>
    `
  );
});

app.get('/__/auth/passwordless/create-token', async (req, res, next) => {
  try {
    const email = req.query.email;
    const {passCode, magicLink} = await passwordlessAuthentication.createToken(
      req,
      res,
      email,
      // this state can be anything and
      // will be available when you later
      // validate the token:
      'Hello World'
    );
    await mailTransport.sendMail({
      from: 'noreply@example.com',
      to: email,
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
    res.redirect('/enter-code');
  } catch (ex) {
    if (PasswordlessAuthentication.isInvalidEmailError(ex)) {
      res.redirect(
        '/?err=INVALID_EMAIL&email=' + encodeURIComponent(req.query.email)
      );
      return;
    }
    next(ex);
  }
});
app.get('/enter-code', (req, res, next) => {
  res.send(
    `
      <form action="/__/auth/passwordless/verify">
        <h1>Check your e-mail</h1>
        ${
          req.query.err === 'INCORRECT_CODE'
            ? `<p style="color: red">Please double check the code you entered and try again. You have ${
                req.query.attemptsRemaining
              } attempts remaining.</p>`
            : ``
        }
        <label>
          Enter the 6-digit pass code:
          <input type="tel" name="code">
        </label>
        <button type="submit">Login</button>
        <p>Alternatively, you can just click the "Magic Link" in the e-mail</p>
      </form>
    `
  );
});

// This route handles when the user manually types in the 6-digit code from
// the e-mail
app.get('/__/auth/passwordless/verify', async (req, res, next) => {
  try {
    const {userID, state} = await passwordlessAuthentication.verifyPassCode(
      req,
      res,
      {passCode: req.query.code}
    );
    // You can do what you like with the userID and state here
    // e.g. store it in a session
    res.json({userID, state});
  } catch (ex) {
    if (PasswordlessAuthentication.isExpiredOrInvalidTokenError(ex)) {
      res.redirect('/?err=EXPIRED_TOKEN');
      return;
    }

    if (PasswordlessAuthentication.isIncorrectPassCodeError(ex)) {
      res.redirect(
        '/enter-code?err=INCORRECT_CODE&attemptsRemaining=' +
          ex.attemptsRemaining
      );
      return;
    }
    next(ex);
  }
});

app.listen(3000);
```
