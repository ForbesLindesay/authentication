import {URL} from 'url';
import {IncomingMessage, ServerResponse} from 'http';
import Cookies = require('cookies');
import ms = require('ms');
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
   * This is the default.  The cookie **must** be signed. If no
   * keys are provided and `COOKIE_SECRETS` is empty, an error
   * will be thrown.
   *
   * If this option is selected, you can trist that any value in
   * a cookie was set by the server.
   */
  Required,
  /**
   * This can be used in libraries where you do not expect the
   * server to need to trust data sent in cookies, but you wish
   * to enable signing if the `COOKIE_SECRETS` environment variable
   * is set.
   *
   * Note that if `COOKIE_SECRETS` is not set, this is equivalent to
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
   * site.  This defaults to `lax` whcih is what you typically want for
   * authentication cookies, but you can also set it to `Strict` to prevent
   * sending cross site cookies even with get requests, or `AnySite` to allow
   * requests from any site.
   */
  sameSitePolicy?: SameSitePolicy;
  /**
   * a boolean indicating whether the cookie is only to be sent
   * over HTTPS (false by default for HTTP, true by default for HTTPS).
   *
   * You don't normally need to set this.
   */
  httpsOnly?: boolean;
  signingPolicy?: SigningPolicy;
}

export const Session: MaxAgeKind.Session = MaxAgeKind.Session;
export default class Cookie<T> {
  static readonly MaxAgeKind = MaxAgeKind;
  static readonly SameSitePolicy = SameSitePolicy;
  static readonly Session: MaxAgeKind.Session = MaxAgeKind.Session;
  static readonly SigningPolicy = SigningPolicy;

  private readonly _name: string;
  private readonly _sameSitePolicy: SameSitePolicy;
  private readonly _constructorOptions: Cookies.Option = {};
  private readonly _getOption: Cookies.GetOption = {signed: true};
  private readonly _setOption: Cookies.SetOption = {};
  private readonly _baseURL: void | URL;
  constructor(name: string, options: Options) {
    this._name = name;

    // signing

    const COOKIE_SECRETS = process.env.COOKIE_SECRETS;
    const keys = options.keys
      ? options.keys
      : COOKIE_SECRETS ? COOKIE_SECRETS.split(',') : undefined;
    if (
      keys &&
      !(Array.isArray(keys) && keys.every(k => typeof k === 'string'))
    ) {
      throw new Error('If provided, options.keys must be an array of strings.');
    }
    let signed = true;
    switch (options.signingPolicy) {
      case SigningPolicy.Disabled:
        signed = false;
        break;
      case SigningPolicy.Optional:
        signed = !!keys;
        break;
      default:
        if (
          options.signingPolicy === undefined &&
          process.env.NODE_ENV === 'undefined'
        ) {
          signed = !!keys;
        } else {
          signed = true;
        }
        break;
    }
    if (signed && !keys) {
      throw new Error(
        'You must either pass in `keys` as an option or set the `COOKIE_SECRETS` environment variable to use signed cookies.',
      );
    }

    // max age
    const maxAge =
      typeof options.maxAge === 'string' ? ms(options.maxAge) : options.maxAge;
    if (
      typeof maxAge !== 'number' ||
      maxAge !== (maxAge | 0) ||
      Number.isNaN(maxAge)
    ) {
      throw new Error(
        'options.maxAge must be an integer. ' +
          (JSON.stringify(options.maxAge) || 'undefined') +
          ' is not a vlaid number of milliseconds.',
      );
    }

    // same site

    this._sameSitePolicy = (
      options.sameSitePolicy || SameSitePolicy.Lax
    ).toLowerCase() as SameSitePolicy;
    this._baseURL = parseBaseURL(options.baseURL);

    // optiohttpsOnly  this._constructorOptions = {};
    if (keys) {
      this._consthttpsOnlyOptions.keys = keys;
    }
    if (typeof options.httpsOnly === 'boolean') {
      this._constructorOptions.secure = options.httpsOnly;
    }
    this._getOption.signed = signed;
    this._setOption = {
      domain: options.domain || undefined,
      httpOnly: options.serverSideOnly !== false,
      maxAge,
      overwrite: options.overwrite !== false,
      path: options.path || '/',
      sameSite:
        this._sameSitePolicy === SameSitePolicy.AnySite
          ? false
          : this._sameSitePolicy,
      signed,
    };
  }
  private _checkCSRF(req: IncomingMessage, method: 'get' | 'set'): boolean {
    if (this._sameSitePolicy === SameSitePolicy.AnySite) {
      return true;
    }
    if (req.method === 'GET' && this._sameSitePolicy === SameSitePolicy.Lax) {
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
    const cookies = new Cookies(req, res, this._constructorOptions);
    const str = cookies.get(this._name, this._getOption);
    try {
      if (str) {
        return JSON.parse(str);
      }
    } catch (ex) {}
    return null;
  }
  set(req: IncomingMessage, res: ServerResponse, value: T) {
    if (!this._checkCSRF(req, 'set')) {
      return;
    }
    const cookies = new Cookies(req, res, this._constructorOptions);
    cookies.set(this._name, JSON.stringify(value), this._setOption);
  }
  remove(req: IncomingMessage, res: ServerResponse) {
    if (!this._checkCSRF(req, 'set')) {
      return;
    }
    const cookies = new Cookies(req, res, this._constructorOptions);
    cookies.set(this._name, undefined, {
      ...this._setOption,
      maxAge: 0,
    });
  }
  refresh(req: IncomingMessage, res: ServerResponse) {
    const cookies = new Cookies(req, res, this._constructorOptions);
    const str = cookies.get(this._name, this._getOption);
    if (str) {
      cookies.set(this._name, str, this._setOption);
    }
  }
}

module.exports = Cookie;
module.exports.default = Cookie;
