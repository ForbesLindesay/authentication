import {URL} from 'url';
import {Request, Response, NextFunction} from 'express';
import Cookie from '@authentication/cookie';
import {Mixed} from '@authentication/types';
import AuthorizationError from './errors/AuthorizationError';
import StateVerificationFailure from './errors/StateVerificationFailure';
import MemoryStore from './MemoryStore';
import TokenStore from './TokenStore';
import originalURL from './originalURL';
const OAuth1Base = require('oauth').OAuth;

function parseURL(name: string, input: URL | string, base?: string | URL) {
  if (typeof input === 'string') {
    try {
      return new URL(input, base);
    } catch (ex) {
      throw new Error(`${name} was not a valid URL. ${ex.message}`);
    }
  }
  if (!(input && typeof input.href === 'string')) {
    throw new Error(
      `${name} was not a valid URL. Expected either a string, or a URL instance.`,
    );
  }
  return input;
}

export enum SignatureMethod {
  PLAIN_TEXT = 'PLAINTEXT',
  HMAC_SHA1 = 'HMAC-SHA1',
  RSA_SHA1 = 'RSA-SHA1',
}
export interface Options<TokenID> {
  /**
   * provide keys to sign the cookie used to store "state"
   */
  cookieKeys?: string[];
  /**
   * Optionally override the default name for the cookie used to store "state"
   *
   * default: "authentication_oauth1"
   */
  cookieName?: string;
  /**
   * URL used to obtain an unauthorized request token
   */
  requestTokenURL: string | URL;
  /**
   * URL used to exchange a user-authorized request token for an access token
   */
  accessTokenURL: string | URL;
  /**
   * URL used to obtain user authorization
   */
  userAuthorizationURL: string | URL;
  /**
   * identifies client to service provider
   */
  consumerKey: string;
  /**
   * secret used to establish ownership of the consumer key
   */
  consumerSecret: string;
  /**
   * signature method used to sign the request (default: 'HMAC-SHA1')
   */
  signatureMethod?: SignatureMethod;
  /**
   * URL to which the service provider will redirect the user after obtaining authorization
   */
  callbackURL?: string | URL;
  /**
   * This store is used to store "oauth_token_secret". By default, these secrets are stored
   * in memory, but if you have multiple servers and do not implemnet sticky sessions, you
   * will need to store these out of process somewhere.
   */
  tokenStore?: TokenStore<TokenID>;
  trustProxy?: boolean;
  customHeaders?: {[key: string]: string};
}
export interface InitOptions<State> {
  callbackURL?: string | URL;
  requestTokenParams?: {[key: string]: string};
  userAuthorizationParams?: {[key: string]: string};
  state?: State;
}

export default class OAuth1Authentication<State = Mixed, TokenID = number> {
  private readonly _callbackURL: void | string | URL;
  private readonly _cookie: Cookie<{i: TokenID; d?: State}>;
  private readonly _base: any;
  private readonly _trustProxy: void | boolean;
  private readonly _userAuthorizationURL: URL;
  private readonly _tokenStore: TokenStore<TokenID>;
  constructor(options: Options<TokenID>) {
    if (!options.cookieKeys && !process.env.COOKIE_SECRETS) {
      throw new Error(
        'You must either pass in `cookieKeys` or set COOKIE_SECRETS to use oauth1',
      );
    }
    this._cookie = new Cookie(options.cookieName || 'authentication_oauth1', {
      keys: options.cookieKeys,
      maxAge: Cookie.Session,
      sameSitePolicy: Cookie.SameSitePolicy.AnySite,
      signingPolicy: Cookie.SigningPolicy.Required,
    });
    const requestTokenURL = parseURL(
      'options.requestTokenURL',
      options.requestTokenURL,
    );
    const accessTokenURL = parseURL(
      'options.accessTokenURL',
      options.accessTokenURL,
    );
    this._userAuthorizationURL = parseURL(
      'options.userAuthorizationURL',
      options.userAuthorizationURL,
    );
    if (!options.consumerKey) {
      throw new TypeError('OAuthStrategy requires a consumerKey option');
    }
    if (options.consumerSecret === undefined) {
      throw new TypeError('OAuthStrategy requires a consumerSecret option');
    }
    this._base = new OAuth1Base(
      requestTokenURL.href,
      accessTokenURL.href,
      options.consumerKey,
      options.consumerSecret,
      '1.0',
      null,
      options.signatureMethod || SignatureMethod.HMAC_SHA1,
      null,
      options.customHeaders,
    );
    this._tokenStore = options.tokenStore || (new MemoryStore() as any);
    this._trustProxy = options.trustProxy;
  }

  private getOAuthAccessToken(
    oauthToken: string,
    oauthTokenSecret: string,
    oauthVerifier: void | null | string,
  ): Promise<{
    token: string;
    tokenSecret: string;
    params: {[key: string]: string};
  }> {
    return new Promise((resolve, reject) => {
      this._base.getOAuthAccessToken(
        oauthToken,
        oauthTokenSecret,
        oauthVerifier,
        (
          err: any,
          token: string,
          tokenSecret: string,
          params: {[key: string]: string},
        ) => {
          if (err) reject(err);
          else
            resolve({
              token,
              tokenSecret,
              params,
            });
        },
      );
    });
  }
  private getOAuthRequestToken(params: {
    [key: string]: string;
  }): Promise<{
    token: string;
    tokenSecret: string;
    params: {
      [key: string]: string;
    };
  }> {
    return new Promise((resolve, reject) => {
      this._base.getOAuthRequestToken(
        params,
        (
          err: any,
          token: string,
          tokenSecret: string,
          params: {
            [key: string]: string;
          },
        ) => {
          if (err) reject(err);
          else
            resolve({
              token,
              tokenSecret,
              params,
            });
        },
      );
    });
  }
  get(url: string | URL, token: string, tokenSecret: string) {
    return new Promise<{body: string; res: any}>((resolve, reject) => {
      this._base.get(
        typeof url === 'string' ? url : url.href,
        token,
        tokenSecret,
        (err: any, body: string, res: any) => {
          if (err) reject(err);
          else resolve({body, res});
        },
      );
    });
  }

  isCallbackRequest(req: Request): boolean {
    return !!(req.query && req.query.oauth_token);
  }

  /**
   * Begin authentication by getting the URL to redirect the user to on the OAuth 1.0 service provider
   */
  private async _redirectToProvider(
    req: Request,
    res: Response,
    options: InitOptions<State> = {},
  ): Promise<void> {
    // In order to authenticate via OAuth, the application must obtain a request
    // token from the service provider and redirect the user to the service
    // provider to obtain their authorization.  After authorization has been
    // approved the user will be redirected back the application, at which point
    // the application can exchange the request token for an access token.
    //
    // In order to successfully exchange the request token, its corresponding
    // token secret needs to be known.  The token secret will be temporarily
    // stored, so that it can be retrieved upon the user being
    // redirected back to the application.

    const requestTokenParams: {
      [key: string]: string;
    } = options.requestTokenParams ? {...options.requestTokenParams} : {};

    const callbackURLInitial = options.callbackURL || this._callbackURL;
    const callbackURL =
      typeof callbackURLInitial === 'string'
        ? new URL(
            callbackURLInitial,
            originalURL(req, {trustProxy: this._trustProxy}),
          )
        : callbackURLInitial;
    if (callbackURL) {
      requestTokenParams.oauth_callback = callbackURL.href;
    }
    const {token, tokenSecret, params} = await this.getOAuthRequestToken(
      requestTokenParams,
    );
    const tokenID = await this._tokenStore.save(tokenSecret);
    this._cookie.set(req, res, {d: options.state, i: tokenID});

    const userAuthorizationURL = new URL(this._userAuthorizationURL.href);
    userAuthorizationURL.searchParams.set('oauth_token', token);
    if (!params.oauth_callback_confirmed && callbackURL) {
      // NOTE: If oauth_callback_confirmed=true is not present when issuing a
      //       request token, the server does not support OAuth 1.0a.  In this
      //       circumstance, `oauth_callback` is passed when redirecting the
      //       user to the service provider.
      userAuthorizationURL.searchParams.set('oauth_callback', callbackURL.href);
    }
    const userAuthorizationParams = options.userAuthorizationParams;
    if (userAuthorizationParams) {
      Object.keys(userAuthorizationParams).forEach(key => {
        userAuthorizationURL.searchParams.set(
          key,
          userAuthorizationParams[key],
        );
      });
    }
    res.redirect(userAuthorizationURL.href);
  }
  /**
   * Begin authentication by getting the URL to redirect the user to on the OAuth 1.0 service provider
   */
  redirectToProvider(
    req: Request,
    res: Response,
    next: NextFunction,
    options: InitOptions<State> = {},
  ) {
    this._redirectToProvider(req, res, options).catch(next);
  }

  async completeAuthentication(req: Request, res: Response) {
    if (!(req.query && req.query.oauth_token)) {
      throw new AuthorizationError(
        'MISSING_CODE',
        'The request is missing the "oauth_token" query string parameter.',
        undefined,
      );
    }

    // The request being authenticated contains an oauth_token parameter in the
    // query portion of the URL.  This indicates that the service provider has
    // redirected the user back to the application, after authenticating the
    // user and obtaining their authorization.
    //
    // The value of the oauth_token parameter is the request token.  Together
    // with knowledge of the token secret (stored in the session), the request
    // token can be exchanged for an access token and token secret.
    //
    // This access token and token secret, along with the optional ability to
    // fetch profile information from the service provider, is sufficient to
    // establish the identity of the user.
    const oauthToken: string = req.query.oauth_token;
    const cookie = this._cookie.get(req, res);
    if (!cookie) {
      throw new StateVerificationFailure(
        'The cookie used to verify state in the oauth transaction was not set.',
      );
    }
    this._cookie.remove(req, res);
    const {d: state, i: tokenID} = cookie;
    const oauthTokenSecret = await this._tokenStore.retrieve(tokenID);
    if (!oauthTokenSecret) {
      throw new StateVerificationFailure(
        'The oauth provider did not provide a valid "state" parameter in the response.',
      );
    }

    // NOTE: The oauth_verifier parameter will be supplied in the query portion
    //       of the redirect URL, if the server supports OAuth 1.0a.
    const oauthVerifier: string | null = req.query.oauth_verifier || null;

    const {token, tokenSecret, params} = await this.getOAuthAccessToken(
      oauthToken,
      oauthTokenSecret,
      oauthVerifier,
    );
    return {token, tokenSecret, params, state};
  }
}
