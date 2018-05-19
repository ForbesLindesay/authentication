import {URL} from 'url';
import {IncomingMessage, ServerResponse} from 'http';
import ms = require('ms');
import {
  KeygripSecret,
  KeygripPublic,
  KeygripPassThrough,
  Keygrip,
} from '@authentication/keygrip';
import {
  setCookie,
  getCookie,
  removeCookie,
  Options as RawCookieOptions,
} from '@authentication/raw-cookie';
import isSameOrigin from './isSameOrigin';
import parseBaseURL from './parseBaseURL';

export enum MaxAgeKind {
  Session = 0,
}
export enum SameSitePolicy {
  /**
   * Ignore cookie if the request does not come from the current origin,
   * regardless of `req.method`.
   */
  Strict = 'strict',
  /**
   * Ignore cookie if the request does not come from the current origin,
   * unless the request is a `GET` request.
   */
  Lax = 'lax',
  /**
   * Allow the cookie from any domain.
   */
  AnySite = 'any-site',
}
export enum SigningPolicy {
  /**
   * This is the default in production.  The cookie **must** be signed. If no
   * keys are provided and `SECURE_KEY` is empty, an error
   * will be thrown.
   *
   * If this option is selected, you can trust that any value in
   * a cookie was set by the server.
   */
  Required,
  /**
   * This can be used in libraries where you do not expect the
   * server to need to trust data sent in cookies, but you wish
   * to enable signing if the `SECURE_KEY` environment variable
   * is set.
   *
   * Note that if `SECURE_KEY` is not set, this is equivalent to
   * `Disabled`.
   */
  Optional,
  /**
   * Use this if you know that you will not need to trust the data
   * stored in the cookie.  For example, you could use this for
   * something like a user preference for font-size.
   */
  Disabled,
}
export enum EncryptionPolicy {
  /**
   * This is the default in production. The cookie **must**
   * be encrypted. If no keys are provided and `SECURE_KEY`
   * is empty, an error will be thrown.
   *
   * If this option is selected, you can trust that any value in
   * a cookie will be kept secret
   */
  Required,
  /**
   * This can be used in libraries where you do not expect
   * secret data to be sent in cookies, but you wish
   * to enable encryption if the `SECURE_KEY` environment variable
   * is set.
   *
   * Note that if `SECURE_KEY` is not set, this is equivalent to
   * `Disabled`.
   */
  Optional,
  /**
   * Use this if you know that you will not have secret data
   * stored in the cookie.  For example, you could use this for
   * something like a user preference for font-size.
   */
  Disabled,
}
export interface Options {
  /**
   * A base url used to check the sameSitePolicy.  If this is not set, we
   * will attempt to infer the baseURL from the request's headers.
   */
  baseURL?: string | URL;
  /**
   * a string indicating the domain of the cookie (no default).
   */
  domain?: string;
  /**
   * a boolean indicating whether the cookie is only to be sent over HTTP(S),
   * and not made available to client JavaScript (true by default).
   */
  serverSideOnly?: boolean;
  keys?: string[];
  /**
   * a number representing the milliseconds from Date.now() for expiry or
   * a string to be parsed by the `ms` library.
   *
   * Set this to `Cookie.Session` to expire at the end of the current browser
   * session.
   */
  maxAge: MaxAgeKind.Session | number | string;
  /**
   * a boolean indicating whether to overwrite previously set
   * cookies of the same name (true by default). If this is true,
   * all cookies set during the same request with the same
   * name (regardless of path or domain) are filtered out of
   * the Set-Cookie header when setting this cookie.
   */
  overwrite?: boolean;
  /**
   * a string indicating the path of the cookie (/ by default).
   */
  path?: string;
  /**
   * This prevents CSRF by only allowing cookies for requests from the same
   * site.  This defaults to `lax` which is what you typically want for
   * authentication cookies, but you can also set it to `Strict` to prevent
   * sending cross site cookies even with get requests, or `AnySite` to allow
   * requests from any site.
   */
  sameSitePolicy?:
    | SameSitePolicy
    | {read: SameSitePolicy; write: SameSitePolicy};
  /**
   * a boolean indicating whether the cookie is only to be sent
   * over HTTPS (false by default for HTTP, true by default for HTTPS).
   *
   * You don't normally need to set this.
   */
  httpsOnly?: boolean;
  signingPolicy?: SigningPolicy;
  encryptionPolicy?: EncryptionPolicy;
}

export const Session: MaxAgeKind.Session = MaxAgeKind.Session;
export default class Cookie<T> {
  static readonly MaxAgeKind = MaxAgeKind;
  static readonly SameSitePolicy = SameSitePolicy;
  static readonly Session: MaxAgeKind.Session = MaxAgeKind.Session;
  static readonly SigningPolicy = SigningPolicy;
  static readonly EncryptionPolicy = EncryptionPolicy;

  private readonly _name: string;
  private readonly _writeSameSitePolicy: SameSitePolicy;
  private readonly _readSameSitePolicy: SameSitePolicy;
  private readonly _baseURL: void | URL;
  private readonly _cacheSymbol: symbol;

  private readonly _rawOptions: RawCookieOptions;
  private readonly _keygrip: Keygrip;

  constructor(name: string, options: Options) {
    this._name = name;
    this._cacheSymbol = Symbol('Cookie Value Cache: ' + name);

    // signing

    const SECURE_KEY = process.env.SECURE_KEY;
    const keys = options.keys
      ? options.keys
      : SECURE_KEY ? SECURE_KEY.split(',') : undefined;
    if (
      keys &&
      !(Array.isArray(keys) && keys.every(k => typeof k === 'string'))
    ) {
      throw new Error('If provided, options.keys must be an array of strings.');
    }
    let signed = true;
    let encrypted = true;
    switch (options.encryptionPolicy) {
      case EncryptionPolicy.Disabled:
        encrypted = false;
        break;
      case EncryptionPolicy.Optional:
        encrypted = !!keys;
        break;
      default:
        if (
          options.encryptionPolicy === undefined &&
          process.env.NODE_ENV === 'development'
        ) {
          encrypted = !!keys;
        } else {
          encrypted = true;
        }
        break;
    }
    switch (options.signingPolicy) {
      case SigningPolicy.Disabled:
        signed = false;
        if (encrypted) {
          throw new Error(
            'Enabling encryption implicitly enables signing. If you want to disable both, you must pass {encryptionPolicy: EncryptionPolicy.Disabled, signingPolicy: SigningPolicy.Disabled}',
          );
        }
        break;
      case SigningPolicy.Optional:
        signed = !!keys;
        break;
      default:
        if (
          options.signingPolicy === undefined &&
          process.env.NODE_ENV === 'development'
        ) {
          signed = !!keys;
        } else {
          signed = true;
        }
        break;
    }
    if ((signed || encrypted) && !keys) {
      throw new Error(
        'You must either pass in `keys` as an option or set the `SECURE_KEY` environment variable to use signed or encrypted cookies.',
      );
    }
    if (encrypted) {
      this._keygrip = new KeygripSecret(keys!);
    } else if (signed) {
      this._keygrip = new KeygripPublic(keys!);
    } else {
      this._keygrip = new KeygripPassThrough();
    }

    // max age
    const maxAgeMilliseconds =
      typeof options.maxAge === 'string' ? ms(options.maxAge) : options.maxAge;
    if (
      typeof maxAgeMilliseconds !== 'number' ||
      maxAgeMilliseconds !== Math.round(maxAgeMilliseconds) ||
      maxAgeMilliseconds >= Number.MAX_SAFE_INTEGER ||
      Number.isNaN(maxAgeMilliseconds)
    ) {
      throw new Error(
        'options.maxAge must be an integer or a number understood by the ms library. ' +
          (JSON.stringify(options.maxAge) || 'undefined') +
          ' is not a valid number of milliseconds.',
      );
    }

    // same site
    const sameSitePolicy = options.sameSitePolicy || SameSitePolicy.Lax;
    if (typeof sameSitePolicy === 'object') {
      const writePolicy = sameSitePolicy.write.toLowerCase() as SameSitePolicy;
      if (
        writePolicy !== SameSitePolicy.AnySite &&
        writePolicy !== SameSitePolicy.Lax &&
        writePolicy !== SameSitePolicy.Strict
      ) {
        throw new Error(
          'Invalid write same site policy, should be Strict, Lax or AnySite',
        );
      }
      const readPolicy = sameSitePolicy.read.toLowerCase() as SameSitePolicy;
      if (
        readPolicy !== SameSitePolicy.AnySite &&
        readPolicy !== SameSitePolicy.Lax &&
        readPolicy !== SameSitePolicy.Strict
      ) {
        throw new Error(
          'Invalid read same site policy, should be Strict, Lax or AnySite',
        );
      }
      this._writeSameSitePolicy = writePolicy;
      this._readSameSitePolicy = readPolicy;
    } else {
      const policy = sameSitePolicy.toLowerCase() as SameSitePolicy;
      if (
        policy !== SameSitePolicy.AnySite &&
        policy !== SameSitePolicy.Lax &&
        policy !== SameSitePolicy.Strict
      ) {
        throw new Error(
          'Invalid same site policy, should be Strict, Lax or AnySite',
        );
      }
      this._writeSameSitePolicy = policy;
      this._readSameSitePolicy = policy;
    }
    this._baseURL = parseBaseURL(options.baseURL);

    this._rawOptions = {
      domain: options.domain || undefined,
      serverSideOnly: options.serverSideOnly !== false,
      maxAgeMilliseconds,
      overwrite: options.overwrite !== false,
      path: options.path || '/',
      sameSite:
        this._readSameSitePolicy === SameSitePolicy.AnySite
          ? false
          : this._readSameSitePolicy,
    };
  }
  private _checkCSRF(req: IncomingMessage, method: 'get' | 'set'): boolean {
    const sameSitePolicy =
      method === 'get' ? this._readSameSitePolicy : this._writeSameSitePolicy;
    if (sameSitePolicy === SameSitePolicy.AnySite) {
      return true;
    }
    if (req.method === 'GET' && sameSitePolicy === SameSitePolicy.Lax) {
      return true;
    }
    if (!isSameOrigin(req, this._baseURL)) {
      console.warn(
        'CSRF check failed. Refusing to ' +
          method +
          ' the cookie, ' +
          this._name +
          ', because the request did not match the expected origin.',
      );
      return false;
    }
    return true;
  }
  get(req: IncomingMessage, res: ServerResponse): T | null {
    if (!this._checkCSRF(req, 'get')) {
      return null;
    }
    if ((req as any)[this._cacheSymbol]) {
      return (req as any)[this._cacheSymbol].value;
    }
    const ciphertext = getCookie(req, res, this._name);
    const result = ciphertext ? this._keygrip.unpackString(ciphertext) : null;
    try {
      if (result) {
        if (result.outdated) {
          setCookie(
            req,
            res,
            this._name,
            this._keygrip.packString(result.payload),
            this._rawOptions,
          );
        }
        const value = JSON.parse(result.payload);
        (req as any)[this._cacheSymbol] = {value};
        return value;
      }
    } catch (ex) {}
    (req as any)[this._cacheSymbol] = {value: null};
    return null;
  }
  set(req: IncomingMessage, res: ServerResponse, value: T) {
    if (!this._checkCSRF(req, 'set')) {
      return;
    }
    const str = JSON.stringify(value);
    const ciphertext = this._keygrip.packString(str);
    setCookie(req, res, this._name, ciphertext, this._rawOptions);
    (req as any)[this._cacheSymbol] = {value};
  }
  remove(req: IncomingMessage, res: ServerResponse) {
    if (!this._checkCSRF(req, 'set')) {
      return;
    }
    removeCookie(req, res, this._name, this._rawOptions);
    (req as any)[this._cacheSymbol] = {value: null};
  }
  refresh(req: IncomingMessage, res: ServerResponse) {
    const ciphertext = getCookie(req, res, name);
    if (ciphertext) {
      const result = this._keygrip.unpackString(ciphertext);
      if (result) {
        setCookie(
          req,
          res,
          this._name,
          result.outdated
            ? this._keygrip.packString(result.payload)
            : ciphertext,
          this._rawOptions,
        );
      } else {
        removeCookie(req, res, this._name, this._rawOptions);
      }
    }
  }
}

module.exports = Cookie;
module.exports.default = Cookie;
