import Cookie from '@authentication/cookie';
import generatePassCode, {Encoding} from '@authentication/generate-passcode';
import isEmail from '@authentication/is-email';
import LockByID from '@authentication/lock-by-id';
import {
  RateLimit,
  RateLimitState,
  ExponentialRateLimit,
  ExponentialOptions,
  BucketRateLimit,
  BucketOptions,
  TransactionalStoreAPI as RateLimitStoreAPI,
  isRateLimitExceededError,
  RateLimitExceededError,
} from '@authentication/rate-limit';
import {hash, verify} from '@authentication/secure-hash';
import {URL} from 'url';
import {Request, Response} from 'express';
import ms = require('ms');
import Store, {StoreAPI, TransactionalStoreAPI} from './Store';
import Token from './Token';
import originalURL from './originalURL';

import {
  CreateTokenStatusKind,
  CreateTokenError,
  CreatedToken,
  CreateTokenStatus,
} from './CreateTokenStatus';
import {
  CorrectPassCode,
  VerifyPassCodeError,
  VerifyPassCodeStatusKind,
} from './VerifyPassCodeStatus';

export {Store, StoreAPI, TransactionalStoreAPI};
export {CreateTokenStatusKind, CreateTokenStatus};
export {VerifyPassCodeStatusKind, VerifyPassCodeError};
export type CreateTokenResult =
  | {
      created: false;
      status: CreateTokenError;
      magicLink: void;
      passCode: void;
    }
  | {
      created: true;
      status: CreatedToken;
      magicLink: URL;
      passCode: string;
    };
export type VerifyPassCodeResult<State> =
  | {
      verified: true;
      status: CorrectPassCode;
      userID: string;
      state: State;
    }
  | {verified: false; status: VerifyPassCodeError};

export {
  RateLimitExceededError,
  RateLimitState,
  Token,
  isRateLimitExceededError,
};

export interface IncorrectDosCodeError {
  code: 'INCORRECT_DOS_CODE';
  message: string;
}
export function isIncorrectDosCodeError(
  err: any,
): err is IncorrectDosCodeError {
  return err && err.code === 'INCORRECT_DOS_CODE';
}

export enum UserKind {
  Custom = 'custom',
  EMail = 'email',
  PhoneNumber = 'phone',
}
export {Encoding};
export interface Options<State = void> {
  callbackURL: string | URL;
  cookieName?: string;
  /**
   * By default the tokenID and dosCode is stored in a cookie. This is not
   * necessary if users will be using the magic link, but is needed if
   * they want to use the short code.
   */
  disableCookie?: boolean;
  userKind?: UserKind;
  /**
   * Max age of tokens sent in e-mails before they expire.
   * Defaults to 1 hour.
   */
  maxAge?: number | string;
  /**
   * Maximum number of attempts before the token is destoryed.
   */
  maxAttempts?: number;
  /**
   * Allow the same token to be used to login multiple times.
   */
  multiUse?: boolean;
  /**
   * Length of pass codes, defaults to 6.
   */
  passCodeLength?: number;
  /**
   * The character set of the pass code, defaults to decimal.
   */
  passCodeEncoding?: Encoding;
  store: Store<State>;

  createTokenByIpRateLimit?: BucketOptions;
  createTokenByUserRateLimit?: ExponentialOptions;
  validatePassCodeByIpRateLimit?: BucketOptions;
  trustProxy?: boolean;
}
export interface VerifyPassCodeOptions {
  tokenID?: string;
  dos?: string;
  passCode?: string;
}
export default class PasswordlessAuthentication<State> {
  static readonly Encoding = Encoding;
  static readonly UserKind = UserKind;
  static readonly CreateTokenStatusKind = CreateTokenStatusKind;
  static readonly VerifyPassCodeStatusKind = VerifyPassCodeStatusKind;

  static readonly isIncorrectDosCodeError = isIncorrectDosCodeError;

  private readonly _passCodeLength: number;
  private readonly _passCodeEncoding: Encoding;

  private readonly _store: Store<State>;
  private readonly _maxAge: number;
  private readonly _maxAttempts: number;
  private readonly _cookie: Cookie<{i: string; d: string}>;
  private readonly _lock = new LockByID();

  private readonly _createTokenByIpRateLimit: RateLimit<string>;
  private readonly _createTokenByUserRateLimit: RateLimit<string>;
  private readonly _validatePassCodeByIpRateLimit: RateLimit<string>;

  private readonly _disableCookie: boolean;
  private readonly _multiUse: boolean;
  private readonly _trustProxy: undefined | boolean;
  private readonly _callbackURL: string | URL;
  public readonly callbackPath: string;

  private readonly _userKind: UserKind;

  constructor(options: Options<State>) {
    this._passCodeLength = options.passCodeLength || 6;
    if (
      typeof this._passCodeLength !== 'number' ||
      this._passCodeLength !== (this._passCodeLength | 0)
    ) {
      throw new Error('Invalid pass code length, expected an integer');
    }
    this._passCodeEncoding = options.passCodeEncoding || Encoding.decimal;
    this._userKind = options.userKind || UserKind.EMail;
    this._store = options.store;
    this._maxAge =
      options.maxAge === undefined
        ? ms('1 hour')
        : typeof options.maxAge === 'number'
          ? options.maxAge
          : ms(options.maxAge);
    if (
      typeof this._maxAge !== 'number' ||
      isNaN(this._maxAge) ||
      this._maxAge >= Number.MAX_SAFE_INTEGER ||
      this._maxAge !== Math.floor(this._maxAge)
    ) {
      throw new Error('maxAge is not a valid number of milliseconds.');
    }
    this._maxAttempts = options.maxAttempts || 5;
    if (
      typeof this._maxAttempts !== 'number' ||
      isNaN(this._maxAttempts) ||
      this._maxAttempts !== (this._maxAttempts | 0)
    ) {
      throw new Error('maxAttempts is not a valid integer.');
    }
    this._disableCookie = options.disableCookie || false;
    this._multiUse = options.multiUse || false;
    this._cookie = new Cookie(
      options.cookieName || 'authentication_passwordless',
      {
        sameSitePolicy: Cookie.SameSitePolicy.AnySite,
        maxAge: this._maxAge,
        signingPolicy: Cookie.SigningPolicy.Optional,
      },
    );
    // This prevents someone spamming different e-mail addresses into the
    // system, generating lots of noise for users and lots of un-used tokens.
    // It makes it harder to DoS the other createTokenByUserRateLimit for
    // everyone on the system.
    // We use quite a high bucket size, to allow bursts of people signing in
    // from behind a single router, but over the long run, we want to keep
    // this pretty low or someone could be quite abusive.
    this._createTokenByIpRateLimit = new BucketRateLimit(
      this._getStore(ip => 'create_ip_' + ip),
      {
        interval: '10 minutes',
        maxSize: 20,
        ...(options.createTokenByIpRateLimit || {}),
      },
    );
    // This prevents someone spamming an individual user. We reset the
    // rate limit as soon as one of the tokens is actually used, so we
    // can use an exponential backoff and a significant delay after only
    // a few attempts.  It is possible a user might get spammed with a
    // few token e-mails, but this will quickly stem the tide.
    this._createTokenByUserRateLimit = new ExponentialRateLimit(
      this._getStore(userID => 'user_' + userID),
      {
        baseDelay: '5 minutes',
        factor: 2,
        freeAttempts: 3,
        ...(options.createTokenByUserRateLimit || {}),
      },
    );
    // This prevent someone trying their luck on lots of different tokens.
    // We don't use an exponential backoff because resetting it when a
    // correct token attempt happens would defeat the point.
    this._validatePassCodeByIpRateLimit = new BucketRateLimit(
      this._getStore(ip => 'validate_ip_' + ip),
      {
        interval: '10 minutes',
        maxSize: 20,
        ...(options.validatePassCodeByIpRateLimit || {}),
      },
    );

    this._callbackURL = options.callbackURL;
    this.callbackPath = (typeof options.callbackURL === 'string'
      ? new URL(options.callbackURL, 'http://example.com')
      : options.callbackURL
    ).pathname;
  }
  private getCallbackURL(req: Request) {
    return typeof this._callbackURL === 'string'
      ? new URL(
          this._callbackURL,
          originalURL(req, {trustProxy: this._trustProxy}),
        )
      : new URL(this._callbackURL.href);
  }
  private _tx<T>(
    tokenID: string,
    fn: (store: StoreAPI<State>) => Promise<T>,
  ): Promise<T> {
    return this._lock.withLock(tokenID, () => this._txWithoutLock(fn));
  }
  private _txWithoutLock<T>(
    fn: (store: StoreAPI<State>) => Promise<T>,
  ): Promise<T> {
    if (
      typeof (this._store as TransactionalStoreAPI<State>).tx === 'function'
    ) {
      return (this._store as TransactionalStoreAPI<State>).tx(fn);
    } else {
      return fn(this._store as StoreAPI<State>);
    }
  }
  private _getStore<T>(idToString: (id: T) => string): RateLimitStoreAPI<T> {
    return {
      tx: fn =>
        this._txWithoutLock(store =>
          fn({
            save(id, state) {
              return store.saveRateLimit(idToString(id), state);
            },
            load(id) {
              return store.loadRateLimit(idToString(id));
            },
            remove(id) {
              return store.removeRateLimit(idToString(id));
            },
          }),
        ),
    };
  }
  async createToken(
    req: Request,
    res: Response,
    userID: string,
    state: State,
  ): Promise<CreateTokenResult> {
    if (this._userKind === UserKind.EMail && !isEmail(userID)) {
      return {
        created: false,
        status: {
          kind: CreateTokenStatusKind.InvalidEmail,
          message: 'Please enter a valid e-mail address',
          email: userID,
        },
        magicLink: undefined,
        passCode: undefined,
      };
    }
    try {
      await this._createTokenByIpRateLimit.consume(req.ip);
      await this._createTokenByUserRateLimit.consume(userID);
    } catch (ex) {
      if (!isRateLimitExceededError(ex)) {
        throw ex;
      }
      return {
        created: false,
        status: {
          kind: CreateTokenStatusKind.RateLimitExceeded,
          message: ex.message,
          nextTokenTimestamp: ex.nextTokenTimestamp,
        },
        magicLink: undefined,
        passCode: undefined,
      };
    }
    const [passCode, dosCode] = await Promise.all([
      generatePassCode(this._passCodeLength, this._passCodeEncoding),
      generatePassCode(10, Encoding.base64),
    ]);
    const passCodeHash = await hash(passCode);
    // store the token
    const tokenID = await this._txWithoutLock(store =>
      store.saveToken({
        userID,
        dos: dosCode,
        passCodeHash,
        attemptsRemaining: this._maxAttempts,
        created: Date.now(),
        expiry: Date.now() + this._maxAge,
        state,
        userAgent: '' + (req.headers['user-agent'] || ''),
      }),
    );
    if (!this._disableCookie) {
      this._cookie.set(req, res, {i: tokenID, d: dosCode});
    }
    const magicLink = this.getCallbackURL(req);
    magicLink.searchParams.set('token_id', tokenID);
    magicLink.searchParams.set('dos', dosCode);
    magicLink.searchParams.set('code', passCode);
    return {
      created: true,
      status: {
        kind: CreateTokenStatusKind.CreatedToken,
        tokenID,
        dos: dosCode,
      },
      magicLink,
      passCode,
    };
  }

  isCallbackRequest(req: Request): boolean {
    return !!(req.query && req.query.token_id);
  }
  async verifyPassCode(
    req: Request,
    res: Response,
    options: VerifyPassCodeOptions = {},
  ): Promise<VerifyPassCodeResult<State>> {
    try {
      await this._validatePassCodeByIpRateLimit.consume(req.ip);
    } catch (ex) {
      if (!isRateLimitExceededError(ex)) {
        throw ex;
      }
      return {
        verified: false,
        status: {
          kind: VerifyPassCodeStatusKind.RateLimitExceeded,
          message: ex.message,
          nextTokenTimestamp: ex.nextTokenTimestamp,
        },
      };
    }
    const cookieData = this._disableCookie ? null : this._cookie.get(req, res);
    const query: {[key: string]: string | void} = req.query || {};
    const tokenID =
      options.tokenID || query.token_id || (cookieData && cookieData.i);
    if (!tokenID) {
      return {
        verified: false,
        status: {
          kind: VerifyPassCodeStatusKind.ExpiredToken,
          message: 'Missing token_id parameter',
        },
      };
    }
    if (typeof tokenID !== 'string') {
      throw new Error('Expected token id to be a string');
    }
    const dos = options.dos || query.dos || (cookieData && cookieData.d);
    if (!dos) {
      return {
        verified: false,
        status: {
          kind: VerifyPassCodeStatusKind.ExpiredToken,
          message: 'Missing dos parameter',
        },
      };
    }
    if (typeof dos !== 'string') {
      throw new Error('Expected dos to be a string');
    }
    const passCode = options.passCode || query.code;
    if (passCode != null && typeof passCode !== 'string') {
      throw new Error('Expected passCode to be a string');
    }
    return await this._tx(tokenID, async (store): Promise<
      VerifyPassCodeResult<State>
    > => {
      const token = await store.loadToken(tokenID);
      if (token == null || token.expiry < Date.now()) {
        if (token) {
          await store.removeToken(tokenID);
        }
        return {
          verified: false,
          status: {
            kind: VerifyPassCodeStatusKind.ExpiredToken,
            message:
              'This token has expired, please generate a new one and try again.',
          },
        };
      }
      // dos is only to make it hard to take down your system by hitting every
      // token and using up all the attempts before users can do so. This is why
      // it is not heavily rate limited
      if (token.dos !== dos) {
        const err: IncorrectDosCodeError = new Error('Invalid token') as any;
        err.code = 'INCORRECT_DOS_CODE';
        throw err;
      }
      // pass code attempts remaining, after this one
      await store.updateToken(tokenID, {
        ...token,
        attemptsRemaining: token.attemptsRemaining - 1,
      });
      if (
        passCode &&
        passCode.length === this._passCodeLength &&
        (await verify(
          passCode,
          token.passCodeHash,
          async updatedPassCodeHash => {
            // we're about to delete the token anyway,
            // so no need to update it
          },
        )) === true
      ) {
        if (this._multiUse) {
          await store.updateToken(tokenID, {
            ...token,
            attemptsRemaining: this._maxAttempts,
          });
        } else {
          await store.removeToken(tokenID);
          if (!this._disableCookie) {
            this._cookie.remove(req, res);
          }
        }
        await this._createTokenByUserRateLimit.reset(token.userID);
        return {
          verified: true,
          state: token.state,
          userID: token.userID,
          status: {
            kind: VerifyPassCodeStatusKind.CorrectPassCode,
            userID: token.userID,
          },
        };
      }
      // this was the last attempt
      if (token.attemptsRemaining <= 1) {
        await store.removeToken(tokenID);
        return {
          verified: false,
          status: {
            kind: VerifyPassCodeStatusKind.ExpiredToken,
            message:
              'The pass code was incorrect and you have no more attempts available, please generate a new token and try again.',
          },
        };
      }
      return {
        verified: false,
        status: {
          kind: VerifyPassCodeStatusKind.IncorrectPassCode,
          message: 'Incorrect pass code, please try again.',
          attemptsRemaining: token.attemptsRemaining - 1,
        },
      };
    });
  }
}

module.exports = PasswordlessAuthentication;
module.exports.default = PasswordlessAuthentication;
