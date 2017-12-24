import FacebookAuthentication from '@authentication/facebook';
import GitHubAuthentication from '@authentication/github';
import GoogleAuthentication from '@authentication/google';
import PasswordlessAuthentication, {
  RateLimitState,
  Token,
  CreateTokenStatusKind,
  VerifyPassCodeStatusKind,
} from '@authentication/passwordless';
import getTransport from '@authentication/send-message';
import TwitterAuthentication from '@authentication/twitter';
import ms = require('ms');
import express = require('express');

const app: express.Express = express();

const facebookAuthentication = new FacebookAuthentication<string>({
  callbackURL: '/__/auth/facebook',
});
const gitHubAuthentication = new GitHubAuthentication<string>({
  callbackURL: '/__/auth/github',
});
const googleAuthentication = new GoogleAuthentication<string>({
  callbackURL: '/__/auth/google',
});

let nextTokenID = 0;
const tokens = new Map<string, Token<string>>();
const rateLimit = new Map<string, RateLimitState>();
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
    },
  },
});
const mailTransport = getTransport();
const twitterAuthentication = new TwitterAuthentication<string>({
  callbackURL: '/__/auth/twitter',
});

app.use((req, res, next) => {
  console.log(req.method + ' ' + req.url);
  console.dir(req.headers);
  next();
});

app.get(facebookAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (!facebookAuthentication.isCallbackRequest(req)) {
      facebookAuthentication.redirectToProvider(req, res, next, {
        scope: ['email'],
        state: 'Hello world',
      });
      return;
    }
    if (facebookAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken,
      refreshToken,
      profile,
      rawProfile,
      state,
    } = await facebookAuthentication.completeAuthentication(req, res, {
      imageSize: 256,
    });
    console.log({accessToken, refreshToken, state});
    res.json({profile, rawProfile});
  } catch (ex) {
    next(ex);
  }
});
app.get(gitHubAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (!gitHubAuthentication.isCallbackRequest(req)) {
      gitHubAuthentication.redirectToProvider(req, res, next, {
        state: 'Hello world',
      });
      return;
    }
    if (gitHubAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken,
      refreshToken,
      profile,
      rawProfile,
      rawEmails,
      state,
    } = await gitHubAuthentication.completeAuthentication(req, res);
    console.log({accessToken, refreshToken, state, rawProfile, rawEmails});
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});
app.get(googleAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (!googleAuthentication.isCallbackRequest(req)) {
      googleAuthentication.redirectToProvider(req, res, next, {
        state: 'Hello world',
      });
      return;
    }
    if (googleAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      accessToken,
      refreshToken,
      profile,
      state,
    } = await googleAuthentication.completeAuthentication(req, res);
    console.log({accessToken, refreshToken, state});
    res.json(profile);
  } catch (ex) {
    next(ex);
  }
});
app.get(twitterAuthentication.callbackPath, async (req, res, next) => {
  try {
    if (!twitterAuthentication.isCallbackRequest(req)) {
      twitterAuthentication.redirectToProvider(req, res, next, {
        state: 'Hello world',
      });
      return;
    }
    if (twitterAuthentication.userCancelledLogin(req)) {
      return res.redirect('/');
    }
    const {
      token,
      tokenSecret,
      profile,
      rawProfile,
      state,
    } = await twitterAuthentication.completeAuthentication(req, res);
    console.log({token, tokenSecret, state});
    res.json({profile, rawProfile});
  } catch (ex) {
    next(ex);
  }
});

app.get('/__/auth/passwordless', (req, res, next) => {
  res.send(
    `
      <form action="/__/auth/passwordless/create-token">
        ${
          req.query.err === 'INVALID_EMAIL'
            ? `<p style="color: red">Please check you have entered a valid e-mail</p>`
            : req.query.err === 'EXPIRED_TOKEN'
              ? `<p style="color: red">This token has expired, please enter your e-mail and try again.</p>`
              : req.query.err === 'RATE_LIMIT'
                ? `<p style="color: red">Rate limit exceeded. You can try again in ${ms(
                    parseInt(req.query.timestamp, 10) - Date.now(),
                    {long: true},
                  )}.</p>`
                : ``
        }
        <label>Email:<input type="email" name="email" value="${req.query
          .email || ''}"></label>
        <button type="submit">Login</button>
      </form>
    `,
  );
});
app.get('/__/auth/passwordless/code', (req, res, next) => {
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
        <label>Enter the 6-digit pass code:<input type="tel" name="code"></label>
        <button type="submit">Login</button>
      </form>
    `,
  );
});
app.get('/__/auth/passwordless/create-token', async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.createToken(
      req,
      res,
      req.query.email,
      'Hello World',
    );
    if (result.created) {
      const {magicLink, passCode} = result;
      await mailTransport.sendMail({
        from: 'noreply@example.com',
        to: req.query.email,
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
        `,
      });
      res.redirect('/__/auth/passwordless/code');
    } else {
      const {status} = result;
      switch (status.kind) {
        case CreateTokenStatusKind.InvalidEmail:
          res.redirect(
            '/__/auth/passwordless?err=INVALID_EMAIL&email=' +
              encodeURIComponent(req.query.email),
          );
          break;
        case CreateTokenStatusKind.RateLimitExceeded:
          res.redirect(
            '/__/auth/passwordless?err=RATE_LIMIT&email=' +
              encodeURIComponent(req.query.email) +
              '&timestamp=' +
              encodeURIComponent('' + status.nextTokenTimestamp),
          );
      }
    }
  } catch (ex) {
    next(ex);
  }
});
app.get('/__/auth/passwordless/verify', async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.verifyPassCode(req, res, {
      passCode: req.query.code,
    });
    if (result.verified) {
      const {userID, state} = result;
      res.json({userID, state});
    } else {
      const {status} = result;
      switch (status.kind) {
        case VerifyPassCodeStatusKind.ExpiredToken:
          res.redirect('/__/auth/passwordless?err=EXPIRED_TOKEN');
          break;
        case VerifyPassCodeStatusKind.IncorrectPassCode:
          res.redirect(
            '/__/auth/passwordless/code?err=INCORRECT_CODE&attemptsRemaining=' +
              status.attemptsRemaining,
          );
          break;
        default:
          throw new Error(status.message);
      }
    }
  } catch (ex) {
    next(ex);
  }
});
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
          res.redirect('/__/auth/passwordless?err=EXPIRED_TOKEN');
          break;
        default:
          throw new Error(status.message);
      }
    }
  } catch (ex) {
    next(ex);
  }
});

app.get('/__/email', async (req, res, next) => {
  try {
    res.json(
      await mailTransport.sendMail({
        from: 'me@example.com',
        to: 'them@example.com',
        subject: 'An awesome message',
        text: 'You are awesome!',
        html: '<p>You are <strong>awesome</strong>!',
      }),
    );
  } catch (ex) {
    next(ex);
  }
});
export default app;
