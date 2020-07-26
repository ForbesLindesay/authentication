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
  RateLimitStore,
  RateLimitExceededError,
  isRateLimitExceededError,
} from '@authentication/rate-limit';
import {URL} from 'url';
import ms = require('ms');
import PasswordlessStore, {TokensStore} from './Store';
import Token from './Token';

import {
  PasswordlessResponseKind,
  CreateTokenStatus,
  VerifyTokenError,
  VerifiedToken,
} from './types';

import {
  rateLimitExceededError,
  createdToken,
  invalidEmailError,
  expiredTokenError,
  incorrectPassCodeError,
  verifiedToken,
} from './responses';
import ExpressRequestOrKoaContext from './types/ExpressRequestOrKoaContext';
import {timingSafeEqual} from 'crypto';

export {
  PasswordlessResponseKind,
  RateLimitExceededError,
  RateLimitState,
  Token,
};

export enum UserKind {
  Custom = 'custom',
  EMail = 'email',
  PhoneNumber = 'phone',
}
export {Encoding};
export interface Options<State = undefined> {
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
  store: PasswordlessStore<State>;

  createTokenByIpRateLimit?: BucketOptions;
  createTokenByUserRateLimit?: ExponentialOptions;
  sendEmailByUserRateLimit?: ExponentialOptions;
  validatePassCodeByIpRateLimit?: BucketOptions;
  trustProxy?: boolean;
}

interface CreateTokenOptionsBase {
  userID: string;
  ipAddress: string;
  sendTokenToUser: (token: {
    userID: string;
    passCode: string;
    withCode(url: URL): URL;
  }) => Promise<void>;
}

export type CreateTokenOptions<State> = undefined extends State
  ? CreateTokenOptionsBase & {state?: State}
  : CreateTokenOptionsBase & {state: State};

export interface VerifyPassCodeOptions {
  tokenID: string;
  passCode: string;
  ipAddress: string;
}

export type VerifyPassCodeResult<State> =
  | {verified: true; status: VerifiedToken; userID: string; state: State}
  | {verified: false; status: VerifyTokenError};

function verifyPassCodeError(status: VerifyTokenError) {
  return {verified: false as const, status};
}

export default class PasswordlessAuthentication<State> {
  static readonly Encoding = Encoding;
  static readonly UserKind = UserKind;
  static readonly PasswordlessResponseKind = PasswordlessResponseKind;

  private readonly _passCodeLength: number;
  private readonly _passCodeEncoding: Encoding;
  private readonly _maxAge: number;
  private readonly _maxAttempts: number;
  private readonly _multiUse: boolean;

  private readonly _store: PasswordlessStore<State>;
  private readonly _lock = new LockByID();

  private readonly _createTokenByIpRateLimit: RateLimit<string>;
  private readonly _createTokenByUserRateLimit: RateLimit<string>;
  private readonly _validatePassCodeByIpRateLimit: RateLimit<string>;

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
    this._maxAttempts = options.maxAttempts || 3;
    if (
      typeof this._maxAttempts !== 'number' ||
      isNaN(this._maxAttempts) ||
      this._maxAttempts !== (this._maxAttempts | 0)
    ) {
      throw new Error('maxAttempts is not a valid integer.');
    }
    this._multiUse = options.multiUse || false;

    // This prevents someone spamming different e-mail addresses into the
    // system, generating lots of noise for users and lots of un-used tokens.
    // It makes it harder to DoS the other createTokenByUserRateLimit for
    // everyone on the system.
    // We use quite a high bucket size, to allow bursts of people signing in
    // from behind a single router, but over the long run, we want to keep
    // this pretty low or someone could be quite abusive.
    this._createTokenByIpRateLimit = new BucketRateLimit(
      this._getRateLimitStore((ip) => 'create_ip_' + ip),
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
      this._getRateLimitStore((userID) => 'user_' + userID),
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
      this._getRateLimitStore((ip) => 'validate_ip_' + ip),
      {
        interval: '10 minutes',
        maxSize: 20,
        ...(options.validatePassCodeByIpRateLimit || {}),
      },
    );
  }

  private _tx<T>(
    lockKey: string,
    fn: (store: TokensStore<State>) => Promise<T>,
  ): Promise<T> {
    return this._lock.withLock(lockKey, () => fn(this._store.tokens));
  }
  private _getRateLimitStore<T>(
    idToString: (id: T) => string,
  ): RateLimitStore<T> {
    const store = this._store;
    return {
      save(id, state, oldState) {
        return store.rateLimit.save(idToString(id), state, oldState);
      },
      load(id) {
        return store.rateLimit.load(idToString(id));
      },
      remove(id) {
        return store.rateLimit.remove(idToString(id));
      },
    };
  }

  createToken = async ({
    userID,
    ipAddress,
    state,
    sendTokenToUser,
  }: CreateTokenOptions<State>): Promise<CreateTokenStatus> => {
    if (this._userKind === UserKind.EMail && !isEmail(userID)) {
      return invalidEmailError(userID);
    }

    try {
      await this._createTokenByIpRateLimit.consume(ipAddress);
      await this._createTokenByUserRateLimit.consume(userID);
    } catch (e) {
      const ex: unknown = e;
      if (!isRateLimitExceededError(ex)) {
        throw ex;
      }
      return rateLimitExceededError(ex);
    }

    const passCode = await generatePassCode(
      this._passCodeLength,
      this._passCodeEncoding,
    );

    // store the token
    const tokenID = await this._tx(`user:${userID}`, (store) =>
      store.insert({
        version: 1,
        userID,
        passCode,
        attemptsRemaining: this._maxAttempts,
        created: Date.now(),
        expiry: Date.now() + this._maxAge,
        state: state!,
      }),
    );

    await sendTokenToUser({
      userID,
      passCode,
      withCode: (baseURL) => {
        const magicLink = new URL(baseURL.href);
        if (
          process.env.NODE_ENV !== 'development' &&
          magicLink.protocol !== 'https:'
        ) {
          throw new Error(
            `Cannot use the non-ssl callback URL, "${magicLink.href}", in production. If you are running ` +
              `locally, you can set the NODE_ENV environment variable to development. ` +
              `If you are running in production you can set BASE_URL to the https ` +
              `URL for your app.`,
          );
        }
        magicLink.searchParams.set('id', tokenID);
        magicLink.searchParams.set('code', passCode);
        return magicLink;
      },
    });

    return createdToken(tokenID);
  };

  verifyPassCodeFromRequest = async (
    req: ExpressRequestOrKoaContext,
    options: Omit<VerifyPassCodeOptions, 'tokenID' | 'passCode'>,
  ) => {
    const query = req.query;
    if (typeof query === 'object' && query) {
      const tokenID: unknown = 'id' in query ? (query as any).id : undefined;
      const passCode: unknown =
        'code' in query ? (query as any).code : undefined;
      if (
        typeof tokenID === 'string' &&
        tokenID &&
        typeof passCode === 'string' &&
        passCode
      ) {
        return this.verifyPassCode({...options, tokenID, passCode});
      }
    }
    return null;
  };

  verifyPassCode = async ({
    tokenID,
    passCode,
    ipAddress,
  }: VerifyPassCodeOptions): Promise<VerifyPassCodeResult<State>> => {
    if (!tokenID || typeof tokenID !== 'string') {
      throw new Error('Expected tokenID to be a non-empty string');
    }
    if (!passCode || typeof passCode !== 'string') {
      throw new Error('Expected passCode to be a non-empty string');
    }

    const rateLimit = await this._validatePassCodeByIpRateLimit.tryConsume(
      ipAddress,
    );
    if (!rateLimit.consumed) {
      return verifyPassCodeError(rateLimitExceededError(rateLimit));
    }

    return await this._tx(
      `token:${tokenID}`,
      async (store): Promise<VerifyPassCodeResult<State>> => {
        const token = await store.load(tokenID);
        if (!token) {
          return verifyPassCodeError(expiredTokenError());
        }
        if (token.expiry < Date.now()) {
          await store.remove(tokenID);
          return verifyPassCodeError(expiredTokenError());
        }

        // pass code attempts remaining, after this one
        await store.update(
          tokenID,
          {
            ...token,
            version: token.version + 1,
            attemptsRemaining: token.attemptsRemaining - 1,
          },
          token,
        );

        if (
          passCode &&
          passCode.length === this._passCodeLength &&
          timingSafeEqual(
            Buffer.from(passCode),
            Buffer.from(token.passCode),
          ) === true
        ) {
          await this._createTokenByUserRateLimit.reset(token.userID);
          if (this._multiUse) {
            await store.update(
              tokenID,
              {
                ...token,
                attemptsRemaining: this._maxAttempts,
                version: token.version + 1,
              },
              token,
            );
          } else {
            await store.remove(tokenID);
          }
          return {
            verified: true,
            state: token.state,
            userID: token.userID,
            status: verifiedToken(token.userID),
          };
        }

        // this was the last attempt
        if (token.attemptsRemaining <= 1) {
          await store.remove(tokenID);
        }

        return verifyPassCodeError(
          incorrectPassCodeError(token.attemptsRemaining - 1),
        );
      },
    );
  };
}

module.exports = Object.assign(PasswordlessAuthentication, {
  default: PasswordlessAuthentication,
});
