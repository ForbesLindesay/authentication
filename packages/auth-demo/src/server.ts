import {URL} from 'url';
import FacebookAuthentication from '@authentication/facebook';
import GitHubAuthentication from '@authentication/github';
import GoogleAuthentication from '@authentication/google';
import PasswordlessAuthentication, {
  RateLimitState,
  Token,
  PasswordlessResponseKind,
} from '@authentication/passwordless';
import getTransport from '@authentication/send-message';
import TwitterAuthentication from '@authentication/twitter';
import {json} from 'body-parser';
import express = require('express');
import getRequestURL from '@authentication/request-url';

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
  // callbackURL: '/__/auth/passwordless/callback',
  store: {
    tokens: {
      async insert(token: Token<string>) {
        const tokenID = '' + nextTokenID++;
        tokens.set(tokenID, token);
        return tokenID;
      },
      async load(tokenID: string) {
        return tokens.get(tokenID) || null;
      },
      async update(
        tokenID: string,
        token: Token<string>,
        oldToken: Token<string>,
      ) {
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
      },
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
      },
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
        userID: userID,
        state: 'Hello World',
        async sendTokenToUser({passCode, withCode}) {
          const magicLink = withCode(
            new URL('/__/auth/passwordless/callback', getRequestURL(req)),
          );
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
          `,
          });
        },
      });
      res.json(result);
    } catch (ex) {
      next(ex);
    }
  },
);
app.post(
  '/__/auth/passwordless/verify-pass-code',
  json(),
  async (req, res, next) => {
    try {
      const result = await passwordlessAuthentication.verifyPassCode({
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
  },
);
app.get('/__/auth/passwordless/callback', async (req, res, next) => {
  try {
    const result = await passwordlessAuthentication.verifyPassCodeFromRequest(
      req,
      {ipAddress: req.connection.remoteAddress || 'unknown_ip'},
    );
    if (!result) {
      res.status(400).send('Missing the expected parameters');
      return;
    }
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
