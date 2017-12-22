import Cookie from '@authentication/cookie';
import generatePassCode, {Encoding} from '@authentication/generate-passcode';
import isEmail from '@authentication/is-email';
import LockByID from '@authentication/lock-by-id';
import {
  RateLimit,
  ExponentialRateLimit,
  ExponentialOptions,
  BucketRateLimit,
  BucketOptions,
  TransactionalStoreAPI as RateLimitStoreAPI,
} from '@authentication/rate-limit';
import {hash, verify} from '@authentication/secure-hash';
import {URL} from 'url';
import {Request, Response} from 'express';
import ms = require('ms');
import Store, {StoreAPI, TransactionalStoreAPI} from './Store';
import originalURL from './originalURL';

export interface InvalidEmailError {
  code: 'INVALID_EMAIL';
  message: string;
  email: string;
}
export function isInvalidEmailError(err: any): err is InvalidEmailError {
  return err && err.code === 'INVALID_EMAIL';
}
export interface ExpiredOrInvalidTokenError {
  code: 'EXPIRED_TOKEN';
  message: string;
}
export function isExpiredOrInvalidTokenError(
  err: any,
): err is ExpiredOrInvalidTokenError {
  return err && err.code === 'EXPIRED_TOKEN';
}
export interface IncorrectDosCodeError {
  code: 'INCORRECT_DOS_CODE';
  message: string;
}
export function isIncorrectDosCodeError(
  err: any,
): err is IncorrectDosCodeError {
  return err && err.code === 'INCORRECT_DOS_CODE';
}
export interface IncorrectPassCodeError {
  code: 'INCORRECT_PASS_CODE';
  message: string;
  attemptsRemaining: number;
  expiresAt: number;
}
export function isIncorrectPassCodeError(
  err: any,
): err is IncorrectPassCodeError {
  return err && err.code === 'INCORRECT_PASS_CODE';
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
  static readonly isInvalidEmailError = isInvalidEmailError;
  static readonly isExpiredOrInvalidTokenError = isExpiredOrInvalidTokenError;
  static readonly isIncorrectDosCodeError = isIncorrectDosCodeError;
  static readonly isIncorrectPassCodeError = isIncorrectPassCodeError;

  private readonly _store: Store<State>;
  private readonly _maxAge: number;
  private readonly _maxAttempts: number;
  private readonly _cookie: Cookie<{i: string; d: string}>;
  private readonly _lock = new LockByID();

  private readonly _createTokenByIpRateLimit: RateLimit<string>;
  private readonly _createTokenByUserRateLimit: RateLimit<string>;
  private readonly _validatePassCodeByIpRateLimit: RateLimit<string>;

  private readonly _trustProxy: void | boolean;
  private readonly _callbackURL: string | URL;
  public readonly callbackPath: string;

  private readonly _userKind: UserKind;

  constructor(options: Options<State>) {
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
      this._maxAge !== (this._maxAge | 0)
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
  async createToken(req: Request, res: Response, userID: string, state: State) {
    if (this._userKind === UserKind.EMail && !isEmail(userID)) {
      const err: InvalidEmailError = new Error(
        'Please enter a valid e-mail address',
      ) as any;
      err.code = 'INVALID_EMAIL';
      err.email = userID;
      throw err;
    }
    await this._createTokenByIpRateLimit.consume(req.ip);
    await this._createTokenByUserRateLimit.consume(userID);
    const [passCode, dosCode] = await Promise.all([
      generatePassCode(6, Encoding.decimal),
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
    this._cookie.set(req, res, {i: tokenID, d: dosCode});
    // TODO: send the e-mail, passing in userID, extraData, magicLink (as a fully qualified link) and passCode
    const magicLink = this.getCallbackURL(req);
    magicLink.searchParams.set('token_id', tokenID);
    magicLink.searchParams.set('dos', dosCode);
    magicLink.searchParams.set('code', passCode);
    return {passCode, magicLink};
  }

  isCallbackRequest(req: Request): boolean {
    return !!(req.query && req.query.token_id);
  }
  async verifyPassCode(
    req: Request,
    res: Response,
    options: VerifyPassCodeOptions = {},
  ): Promise<{userID: string; state: State}> {
    await this._validatePassCodeByIpRateLimit.consume(req.ip);
    const cookieData: {i?: string; d?: string} =
      this._cookie.get(req, res) || {};
    const query: {[key: string]: string | void} = req.query || {};
    const tokenID = options.tokenID || query.token_id || cookieData.i;
    if (!tokenID) {
      throw new Error('Missing token_id parameter');
    }
    if (typeof tokenID !== 'string') {
      throw new Error('Expected token id to be a string');
    }
    const dos = options.dos || query.dos || cookieData.d;
    if (!dos) {
      throw new Error('Missing dos parameter');
    }
    if (typeof dos !== 'string') {
      throw new Error('Expected dos to be a string');
    }
    const passCode = options.passCode || query.code;
    if (passCode == null) {
      throw new Error('Missing code parameter');
    }
    if (typeof passCode !== 'string') {
      throw new Error('Expected passCode to be a string');
    }
    let success = false;
    let error:
      | ExpiredOrInvalidTokenError
      | IncorrectDosCodeError
      | IncorrectPassCodeError
      | void = undefined;
    const token = await this._tx(tokenID, async store => {
      const token = await store.loadToken(tokenID);
      if (token == null) {
        const err: ExpiredOrInvalidTokenError = new Error(
          'This token has expired, please generate a new one.',
        ) as any;
        err.code = 'EXPIRED_TOKEN';
        error = err;
        return;
      }
      if (token.expiry < Date.now()) {
        await store.removeToken(tokenID);
        const err: ExpiredOrInvalidTokenError = new Error(
          'This token has expired, please generate a new one.',
        ) as any;
        err.code = 'EXPIRED_TOKEN';
        error = err;
        return;
      }
      // dos is only to make it hard to take down your system by hitting every
      // token and using up all the attempts before users can do so. This is why
      // it is not heavily rate limited
      if (token.dos === dos) {
        const err: IncorrectDosCodeError = new Error('Invalid token') as any;
        err.code = 'INCORRECT_DOS_CODE';
        error = err;
        return;
      }
      let deleted = false;
      // pass code attempts including this one
      const attemptsRemaining = token.attemptsRemaining - 1;
      if (attemptsRemaining <= 0) {
        store.removeToken(tokenID);
        deleted = true;
      } else {
        store.updateToken(tokenID, {
          ...token,
          attemptsRemaining,
        });
      }
      if (
        (await verify(
          passCode,
          token.passCodeHash,
          async updatedPassCodeHash => {
            // we're about to delete the token anyway,
            // so no need to update it
          },
        )) === true
      ) {
        if (!deleted) {
          await store.removeToken(tokenID);
        }
        await this._createTokenByUserRateLimit.reset(token.userID);
        success = true;
        return token;
      }
      const err: IncorrectPassCodeError = new Error(
        'Incorrect Pass Code',
      ) as any;
      err.code = 'INCORRECT_PASS_CODE';
      error = err;
      return;
    });
    if (success && token !== undefined) {
      // TODO: suggest a good way to handle mismatch of user-agent browser name
      return {userID: token.userID, state: token.state};
    }
    throw error;
  }
}

module.exports = PasswordlessAuthentication;
module.exports.default = PasswordlessAuthentication;
