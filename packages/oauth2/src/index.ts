import {Agent, ClientResponse} from 'http';
import {URL} from 'url';
import {Request} from 'express';
import AuthorizationError from './errors/AuthorizationError';
import StateVerificationFailure from './errors/StateVerificationFailure';
import TokenError from './errors/TokenError';
import InternalOAuthError from './errors/InternalOAuthError';
import StateStore from './state/StateStore';
import NullStore from './state/NullStore';
import SessionStore from './state/SessionStore';
import originalURL from './originalURL';
const OAuth2Base = require('oauth').OAuth2;

export {StateStore};

export enum StateStoreKind {
  Null = 'Null',
  Session = 'Session',
}
export interface Options {
  clientID: string;
  clientSecret: string;

  /**
   * Provide a base URL if authorizePath or accessTokenPath are relative.
   */
  baseSite?: string | URL;
  // default: '/oauth/authorize'
  authorizePath?: string | URL;
  // default: '/oauth/access_token'
  accessTokenPath?: string | URL;

  customHeaders?: {[key: string]: string};
  /**
   * This 'hack' method is required for sites that don't use
   * 'access_token' as the name of the access token (for requests).
   * ( http://tools.ietf.org/html/draft-ietf-oauth-v2-16#section-7 )
   * it isn't clear what the correct value should be atm, so allowing
   * for specific (temporary?) override for now.
   *
   * default: 'access_token'
   */
  accessTokenName?: string;
  /**
   * Allows you to set an agent to use instead of the default HTTP or
   * HTTPS agents. Useful when dealing with your own certificates.
   */
  agent?: Agent | boolean;
  /**
   * Sets the authorization method for Authorization header.
   * e.g. Authorization: Bearer <token>  # "Bearer" is the authorization method.
   */
  authMethod?: string;
  /**
   * If you use the OAuth2 exposed 'get' method (and don't construct your own _request call )
   * this will specify whether to use an 'Authorize' header instead of passing the access_token as a query parameter
   */
  useAuthorizationHeaderForGET?: boolean;

  sessionKey?: string;
  stateStore?: StateStore | StateStoreKind;
  scopeSeparator?: string;
  callbackURL?: string | URL;
  trustProxy?: boolean;
}
export interface InitOptions {
  callbackURL?: string | URL;
  params?: {[key: string]: string};
  scope?: string | ReadonlyArray<string>;
  state?: string;
}
export interface CallbackOptions {
  callbackURL?: string | URL;
  params?: {[key: string]: string};
}
export {TokenError};

function resolveURL(
  base: undefined | string | URL,
  path: undefined | string | URL,
  defaultPath: string,
) {
  return path === undefined
    ? new URL(defaultPath, base)
    : typeof path === 'string' ? new URL(path, base) : path;
}

/**
 * Parse error response from OAuth 2.0 endpoint.
 *
 * OAuth 2.0-based authentication strategies can overrride this function in
 * order to parse error responses received from the token endpoint, allowing the
 * most informative message to be displayed.
 *
 * If this function is not overridden, the body will be parsed in accordance
 * with RFC 6749, section 5.2.
 */
function parseErrorResponse(body: string, status: number): TokenError | null {
  const json = JSON.parse(body);
  if (json.error) {
    return new TokenError(
      json.error,
      json.error_description,
      json.error_uri,
      status,
    );
  }
  return null;
}

export default class OAuth2Authentication<Results = any> {
  private _base: any;
  private _authorizeURL: URL;
  private _accessTokenURL: URL;
  private _clientID: string;
  private _stateStore: StateStore;
  private _scopeSeparator: string;
  private _callbackURL: void | string | URL;
  private _trustProxy: void | boolean;
  constructor(options: Options) {
    this._authorizeURL = resolveURL(
      options.baseSite,
      options.authorizePath,
      '/oauth/authorize',
    );
    this._accessTokenURL = resolveURL(
      options.baseSite,
      options.accessTokenPath,
      '/oauth/access_token',
    );
    this._clientID = options.clientID;
    this._base = new OAuth2Base(
      options.clientID,
      options.clientSecret,
      '',
      this._authorizeURL.href,
      this._accessTokenURL.href,
      options.customHeaders,
    );
    if (options.accessTokenName !== undefined) {
      this._base.setAccessTokenName(options.accessTokenName);
    }
    if (options.agent !== undefined) {
      this._base.setAgent(options.agent);
    }
    if (options.authMethod !== undefined) {
      this._base.setAuthMethod(options.authMethod);
    }
    if (options.useAuthorizationHeaderForGET !== undefined) {
      this._base.useAuthorizationHeaderforGET(
        options.useAuthorizationHeaderForGET,
      );
    }

    if (options.stateStore && options.stateStore !== StateStoreKind.Null) {
      if (typeof options.stateStore === 'string') {
        switch (options.stateStore) {
          case StateStoreKind.Session:
            this._stateStore = new SessionStore({
              key:
                options.sessionKey || 'oauth2:' + this._authorizeURL.hostname,
            });
        }
      } else {
        this._stateStore = options.stateStore;
      }
    } else {
      this._stateStore = new NullStore();
    }

    this._scopeSeparator = options.scopeSeparator || ' ';
    this._callbackURL = options.callbackURL;
    this._trustProxy = options.trustProxy;
  }

  /**
   * Build the authorization header. In particular, build the part after the colon.
   * e.g. Authorization: Bearer <token>  # Build "Bearer <token>"
   */
  buildAuthHeader(token: string): string {
    return this._base.buildAuthHeader(token);
  }

  getAuthorizeUrl(params?: {[key: string]: string}): string {
    return this._base.getAuthorizeUrl(params ? {...params} : params);
  }

  getOAuthAccessToken(
    code: string,
    params?: {[key: string]: string},
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    results: Results;
  }> {
    return new Promise<{
      accessToken: string;
      refreshToken: string;
      results: Results;
    }>((resolve, reject) => {
      this._base.getOAuthAccessToken(
        code,
        params ? {...params} : {},
        (err: any, accessToken: string, refreshToken: string, results: any) => {
          if (err) {
            if (err.statusCode && err.data) {
              try {
                return reject(parseErrorResponse(err.data, err.statusCode));
              } catch (_) {}
            }
            reject(
              new InternalOAuthError('Failed to obtain access token', err),
            );
          } else {
            resolve({
              accessToken,
              refreshToken,
              results,
            });
          }
        },
      );
    });
  }
  get(
    url: string,
    accessToken: string,
  ): Promise<{
    data: string;
    response: ClientResponse;
  }> {
    return new Promise<{
      data: string;
      response: ClientResponse;
    }>((resolve, reject) => {
      this._base.get(
        url,
        accessToken,
        (err: any, data: string, response: ClientResponse) => {
          if (err) {
            reject(err);
          } else {
            resolve({data, response});
          }
        },
      );
    });
  }

  isCallbackRequest(req: Request): boolean {
    return !!(req.query && (req.query.error || req.query.code));
  }
  userCancelledLogin(req: Request): boolean {
    return req.query && req.query.error === 'access_denied';
  }

  /**
   * Begin authentication by getting the URL to redirect the user to on the OAuth 2.0 service provider
   */
  async authenticateInit(
    req: Request,
    options: InitOptions = {},
  ): Promise<URL> {
    const callbackURLInitial = options.callbackURL || this._callbackURL;
    const callbackURL =
      typeof callbackURLInitial === 'string'
        ? new URL(
            callbackURLInitial,
            originalURL(req, {trustProxy: this._trustProxy}),
          )
        : callbackURLInitial;

    const authorizeUrl = new URL(this._authorizeURL.href);
    const p = options.params;
    if (p) {
      Object.keys(p).forEach(key => {
        authorizeUrl.searchParams.set(key, p[key]);
      });
    }

    authorizeUrl.searchParams.set('response_type', 'code');
    if (callbackURL) {
      authorizeUrl.searchParams.set('redirect_uri', callbackURL.href);
    }
    const scope = options.scope;
    if (scope) {
      authorizeUrl.searchParams.set(
        'scope',
        typeof scope === 'string' ? scope : scope.join(this._scopeSeparator),
      );
    }
    authorizeUrl.searchParams.set('client_id', this._clientID);

    const state = options.state;
    if (state) {
      authorizeUrl.searchParams.set('state', state);
    } else {
      const state = await this._stateStore.store(req, {
        authorizationURL: this._authorizeURL,
        tokenURL: this._accessTokenURL,
        clientID: this._clientID,
      });

      if (state) {
        authorizeUrl.searchParams.set('state', state);
      }
    }

    return authorizeUrl;
  }

  /**
   * Complete authentication by processing the response from the OAuth 2.0 service provider to
   * get the accessToken and refreshToken. These can then be used to fetch a profile.
   */
  async authenticateCallback(
    req: Request,
    options: CallbackOptions = {},
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    results: Results;
  }> {
    if (req.query && req.query.error) {
      throw new AuthorizationError(
        req.query.error,
        req.query.error_description ||
          (req.query.error === 'access_denied'
            ? 'Sign in cancelled'
            : req.query.error),
        req.query.error_uri,
      );
    }

    const callbackURLInitial = options.callbackURL || this._callbackURL;
    const callbackURL =
      typeof callbackURLInitial === 'string'
        ? new URL(
            callbackURLInitial,
            originalURL(req, {trustProxy: this._trustProxy}),
          )
        : callbackURLInitial;

    const verifyStateResult = await this._stateStore.verify(
      req,
      req.query.state,
      {
        authorizationURL: this._authorizeURL,
        tokenURL: this._accessTokenURL,
        clientID: this._clientID,
      },
    );
    const verifyStateInfo =
      verifyStateResult !== true ? verifyStateResult.info : null;
    if (verifyStateResult !== true && verifyStateResult.ok !== true) {
      throw new StateVerificationFailure(
        (verifyStateInfo && verifyStateInfo.message) ||
          'Invalid state in response',
      );
    }

    var code = req.query.code;

    const params: {[key: string]: string} = options.params
      ? {...options.params}
      : {};
    params.grant_type = 'authorization_code';
    if (callbackURL) {
      params.redirect_uri = callbackURL.href;
    }
    const {accessToken, refreshToken, results} = await this.getOAuthAccessToken(
      code,
      params,
    );

    // it's up to the consumer to then load the profile
    return {
      accessToken,
      refreshToken,
      results,
    };
  }

  static StateStoreKind = StateStoreKind;
  static AuthorizationError = AuthorizationError;
  static InternalOAuthError = InternalOAuthError;
  static StateVerificationFailure = StateVerificationFailure;
  static TokenError = TokenError;
}

module.exports = OAuth2Authentication;
module.exports.default = OAuth2Authentication;
