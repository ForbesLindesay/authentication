import {URL} from 'url';
import {Request, Response, NextFunction} from 'express';
import OAuth2Authentication from '@authentication/oauth2';
import {Mixed} from '@authentication/types';
import {Profile} from '@authentication/types';
import parseProfile from './parseProfile';
import GooglePlusAPIError from './errors/GooglePlusAPIError';
import UserInfoError from './errors/UserInfoError';

export interface Options {
  clientID?: string;
  clientSecret?: string;
  callbackURL: string | URL;
  /**
   * Optionally provide keys to sign the cookie used to store "state"
   */
  cookieKeys?: string[];
  /**
   * Optionally override the default name for the cookie used to store "state"
   *
   * default: "authentication_oauth2"
   */
  cookieName?: string;
  trustProxy?: boolean;
}
export interface InitOptions<State> {
  /**
   * see https://developers.google.com/+/web/api/rest/oauth#authorization-scopes
   */
  scope?: string | ReadonlyArray<string>;
  state?: State;

  /**
   * Indicates whether your application can refresh access tokens when the user
   * is not present at the browser. Valid parameter values are online, which is
   * the default value, and offline.
   *
   * Set the value to offline if your application needs to refresh access tokens
   * when the user is not present at the browser. This is the method of refreshing
   * access tokens described in https://developers.google.com/identity/protocols/OAuth2WebServer.
   * This value instructs the Google authorization server to return a refresh token
   * and an access token the first time that your application exchanges an
   * authorization code for tokens.
   */
  offlineAccess?: boolean;
  /**
   * A case-sensitive list of prompts to present the user. If you don't specify
   * this parameter, the user will be prompted only the first time your app requests
   * access.
   */
  prompt?: ('consent' | 'select_account')[];
  /**
   * If your application knows which user is trying to authenticate, it can use
   * this parameter to provide a hint to the Google Authentication Server. The
   * server uses the hint to simplify the login flow either by prefilling the
   * email field in the sign-in form or by selecting the appropriate multi-login
   * session.
   *
   * Set the parameter value to an email address or sub identifier, which is
   * equivalent to the user's Google ID.
   */
  loginHint?: string;
  /**
   * Enables applications to use incremental authorization to request access
   * to additional scopes in context. If you set this parameter's value to true
   * and the authorization request is granted, then the new access token will
   * also cover any scopes to which the user previously granted the application
   * access. See the incremental authorization section of https://developers.google.com/identity/protocols/OAuth2WebServer
   * for examples.
   */
  includeGrantedScopes?: boolean;
  /**
   * Undocumented, used in Google Apps for Work
   */
  hostedDomain?: string;
  /**
   * Used for google+ https://developers.google.com/+/web/app-activities/#writing_an_app_activity_using_the_google_apis_client_libraries
   */
  requestVisibleActions?: string[];
  /**
   * This parameter is needed when migrating users from Google's OpenID 2.0 to OAuth 2.0
   * https://developers.google.com/accounts/docs/OpenID?hl=ja#adjust-uri
   */
  openIDRealm?: string;
}

const userProfileURL = new URL('https://www.googleapis.com/plus/v1/people/me');

export const DEFAULT_SCOPE = [
  'https://www.googleapis.com/auth/plus.login',
  'profile',
  'email',
];

export {GooglePlusAPIError, UserInfoError};

/**
 * The Google authentication strategy authenticates requests by delegating to
 * Google using the OAuth 2.0 protocol.
 */
export default class GoogleAuthentication<State = Mixed> {
  static DEFAULT_SCOPE: ReadonlyArray<string> = DEFAULT_SCOPE;
  private readonly _oauth: OAuth2Authentication<State>;
  public readonly callbackPath: string;
  constructor(options: Options) {
    const clientID =
      options.clientID === undefined
        ? process.env.GOOGLE_CLIENT_ID
        : options.clientID;
    const clientSecret =
      options.clientSecret === undefined
        ? process.env.GOOGLE_CLIENT_SECRET
        : options.clientSecret;
    if (!clientID) {
      throw new Error(
        'You must either specify the `clientID` option when constructing GoogleAuthentication or set the GOOGLE_CLIENT_ID environment variable.',
      );
    }
    if (!clientSecret) {
      throw new Error(
        'You must either specify the `clientSecret` option when constructing GoogleAuthentication or set the GOOGLE_CLIENT_SECRET environment variable.',
      );
    }
    this._oauth = new OAuth2Authentication({
      clientID,
      clientSecret,
      cookieKeys: options.cookieKeys,
      cookieName: options.cookieName,
      authorizeURL: new URL('https://accounts.google.com/o/oauth2/v2/auth'),
      accessTokenURL: new URL('https://www.googleapis.com/oauth2/v4/token'),
      callbackURL: options.callbackURL,
      trustProxy: options.trustProxy,
    });
    this.callbackPath = this._oauth.callbackPath;
  }

  /**
   * Retrieve user profile from Google.
   *
   * This function constructs a normalized profile
   */
  async userProfile(accessToken: string): Promise<Profile> {
    let body = '';
    try {
      body = (await this._oauth.get(userProfileURL, accessToken)).data;
    } catch (err) {
      let json: any = null;
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }

      if (json && json.error && json.error.message) {
        throw new GooglePlusAPIError(json.error.code, json.error.message);
      } else if (json && json.error && json.error_description) {
        throw new UserInfoError(json.error, json.error_description);
      }
      throw new OAuth2Authentication.InternalOAuthError(
        'Failed to fetch user profile',
        err,
      );
    }

    let json = null;
    try {
      json = JSON.parse(body);
    } catch (ex) {
      throw new Error('Failed to parse user profile');
    }

    return parseProfile(json);
  }

  isCallbackRequest(req: Request) {
    return this._oauth.isCallbackRequest(req);
  }
  userCancelledLogin(req: Request) {
    return this._oauth.userCancelledLogin(req);
  }
  redirectToProvider(
    req: Request,
    res: Response,
    next: NextFunction,
    options: InitOptions<State> = {},
  ) {
    return this._oauth.redirectToProvider(req, res, next, {
      scope: options.scope || DEFAULT_SCOPE,
      state: options.state,
      params: authorizationParams(options),
    });
  }
  async completeAuthentication(req: Request, res: Response) {
    const {
      accessToken,
      refreshToken,
      state,
    } = await this._oauth.completeAuthentication(req, res);
    const profile = await this.userProfile(accessToken);
    return {accessToken, refreshToken, profile, state};
  }

  static GooglePlusAPIError = GooglePlusAPIError;
  static UserInfoError = UserInfoError;
}

/**
 * Return extra Google-specific parameters to be included in the authorization
 * request.
 */
function authorizationParams<State>(options: InitOptions<State>) {
  const params: {[key: string]: string} = {};

  // https://developers.google.com/identity/protocols/OAuth2WebServer
  if (options.offlineAccess) {
    params['access_type'] = 'offline';
  }
  if (options.prompt) {
    params['prompt'] = options.prompt.join(' ');
  }
  if (options.loginHint) {
    params['login_hint'] = options.loginHint;
  }
  if (options.includeGrantedScopes !== false) {
    params['include_granted_scopes'] = 'true';
  }

  // Google Apps for Work
  if (options.hostedDomain) {
    // This parameter is derived from Google's OAuth 1.0 endpoint, and (although
    // undocumented) is supported by Google's OAuth 2.0 endpoint was well.
    //   https://developers.google.com/accounts/docs/OAuth_ref
    params['hd'] = options.hostedDomain;
  }

  // Google+
  if (options.requestVisibleActions) {
    // Space separated list of allowed app actions
    // as documented at:
    //  https://developers.google.com/+/web/app-activities/#writing_an_app_activity_using_the_google_apis_client_libraries
    //  https://developers.google.com/+/api/moment-types/
    params['request_visible_actions'] = options.requestVisibleActions.join(' ');
  }

  // OpenID 2.0 migration
  if (options.openIDRealm) {
    // This parameter is needed when migrating users from Google's OpenID 2.0 to OAuth 2.0
    //   https://developers.google.com/accounts/docs/OpenID?hl=ja#adjust-uri
    params['openid.realm'] = options.openIDRealm;
  }

  return params;
}

module.exports = GoogleAuthentication;
module.exports.default = GoogleAuthentication;
