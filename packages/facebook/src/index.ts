import {createHmac} from 'crypto';
import {URL} from 'url';
import {Request, Response, NextFunction} from 'express';
import OAuth2Authentication from '@authentication/oauth2';
import {Mixed, Profile, RedirectStrategy} from '@authentication/types';
import FacebookAuthorizationError from './errors/FacebookAuthorizationError';
import FacebookGraphAPIError from './errors/FacebookGraphAPIError';
import convertProfileFields from './convertProfileFields';
import parseProfile from './parseProfile';

export {Profile};
export interface Options {
  appID?: string;
  appSecret?: string;
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
   * See: https://developers.facebook.com/docs/facebook-login/permissions/
   * e.g. email
   */
  scope?: string | ReadonlyArray<string>;
  state?: State;
  /**
   * See https://developers.facebook.com/docs/facebook-login/manually-build-a-login-flow
   */
  display?: string;
  /**
   * If a user declines your app a given permission, Facebook will not re-request that
   * permission unless you explicilty pass `isReRequest: true`
   */
  isReRequest?: boolean;
}
export interface CallbackOptions {
  imageSize?: number;
  profileFields?: ReadonlyArray<string>;
}

const userProfileURL = new URL('https://graph.facebook.com/v2.5/me');
const permissionsURL = new URL(
  'https://graph.facebook.com/v2.5/me/permissions',
);
export const DEFAULT_SCOPE: string[] = [];
/**
 * The Facebook authentication strategy authenticates requests by delegating to
 * Facebook using the OAuth 2.0 protocol.
 */
export default class FacebookAuthentication<State = Mixed>
  implements RedirectStrategy<State, InitOptions<State>, CallbackOptions> {
  static DEFAULT_SCOPE: ReadonlyArray<string> = DEFAULT_SCOPE;
  private readonly _oauth: OAuth2Authentication<State>;
  private readonly _clientSecret: string;
  public readonly callbackPath: string;
  constructor(options: Options) {
    const clientID =
      options.appID === undefined ? process.env.FACEBOOK_APP_ID : options.appID;
    const clientSecret =
      options.appSecret === undefined
        ? process.env.FACEBOOK_APP_SECRET
        : options.appSecret;
    if (!clientID) {
      throw new Error(
        'You must either specify the `appID` option when constructing FacebookAuthentication or set the FACEBOOK_APP_ID environment variable.',
      );
    }
    if (!clientSecret) {
      throw new Error(
        'You must either specify the `appSecret` option when constructing FacebookAuthentication or set the FACEBOOK_APP_SECRET environment variable.',
      );
    }
    this._clientSecret = clientSecret;
    if (typeof options.callbackURL === 'string') {
      this.callbackPath = new URL(
        options.callbackURL,
        'http://example.com',
      ).pathname;
    } else {
      this.callbackPath = options.callbackURL.pathname;
    }
    this._oauth = new OAuth2Authentication({
      clientID,
      clientSecret,
      cookieKeys: options.cookieKeys,
      cookieName: options.cookieName,
      authorizeURL: new URL('https://www.facebook.com/dialog/oauth'),
      accessTokenURL: new URL('https://graph.facebook.com/oauth/access_token'),
      callbackURL: options.callbackURL,
      trustProxy: options.trustProxy,
    });
  }

  private addProof(url: URL, accessToken: string) {
    // Secure API call by adding proof of the app secret.  This is required when
    // the "Require AppSecret Proof for Server API calls" setting has been
    // enabled.  The proof is a SHA256 hash of the access token, using the app
    // secret as the key.
    //
    // For further details, refer to:
    // https://developers.facebook.com/docs/reference/api/securing-graph-api/
    const proof = createHmac('sha256', this._clientSecret)
      .update(accessToken)
      .digest('hex');
    url.searchParams.set('appsecret_proof', proof);
  }
  private async getPermissions(
    accessToken: string,
  ): Promise<{permission: string; status: 'granted' | 'declined'}[]> {
    const url = new URL(permissionsURL.href);
    this.addProof(url, accessToken);
    let body = '';
    try {
      body = (await this._oauth.get(url, accessToken)).data;
    } catch (err) {
      let json: any = null;
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }

      if (json && json.error && typeof json.error == 'object') {
        throw new FacebookGraphAPIError(
          json.error.code + '',
          json.error.message,
          json.error.type,
          json.error.error_subcode,
          json.error.fbtrace_id,
        );
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
    // { data:
    //   [ { permission: 'email', status: 'granted' },
    //     { permission: 'public_profile', status: 'granted' } ] }
    return json.data;
  }
  /**
   * Retrieve user profile from Facebook.
   *
   * This function constructs a normalized profile
   */
  async getUserProfile(accessToken: string, options: CallbackOptions) {
    const permissions = await this.getPermissions(accessToken);
    const url = new URL(userProfileURL.href);

    this.addProof(url, accessToken);

    const profileFields: Set<string> = options.profileFields
      ? new Set(options.profileFields)
      : new Set();
    if (
      permissions.some(
        ({permission, status}) =>
          permission === 'email' && status === 'granted',
      )
    ) {
      profileFields.add('email');
    }
    if (
      permissions.some(
        ({permission, status}) =>
          permission === 'public_profile' && status === 'granted',
      )
    ) {
      profileFields.add('id');
      profileFields.add('cover');
      profileFields.add('name');
      profileFields.add('first_name');
      profileFields.add('last_name');
      profileFields.add('age_range');
      profileFields.add('link');
      profileFields.add('gender');
      profileFields.add('locale');
      if (
        typeof options.imageSize !== 'number' &&
        typeof options.imageSize !== 'undefined'
      ) {
        throw new Error('Invalid value for options.imageSize');
      }
      if (options.imageSize) {
        profileFields.add(
          `picture.width(${options.imageSize}).height(${options.imageSize})`,
        );
      }
      profileFields.add(`picture.width(500).height(500).as(picture_large)`);
      profileFields.add(`picture.width(200).height(200).as(picture_medium)`);
      profileFields.add(`picture.width(50).height(50).as(picture_small)`);
      profileFields.add('timezone');
      profileFields.add('updated_time');
      profileFields.add('verified');
    }
    const fields = convertProfileFields(profileFields);
    if (fields) {
      url.searchParams.set('fields', fields);
    }

    let body = '';
    try {
      body = (await this._oauth.get(url, accessToken)).data;
    } catch (err) {
      let json: any = null;
      if (err.data) {
        try {
          json = JSON.parse(err.data);
        } catch (_) {}
      }

      if (json && json.error && typeof json.error == 'object') {
        throw new FacebookGraphAPIError(
          json.error.code + '',
          json.error.message,
          json.error.type,
          json.error.error_subcode,
          json.error.fbtrace_id,
        );
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

    return {profile: parseProfile(json), rawProfile: json};
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
  async completeAuthentication(
    req: Request,
    res: Response,
    options: CallbackOptions = {},
  ) {
    // Facebook doesn't conform to the OAuth 2.0 specification, with respect to
    // redirecting with error codes.
    //
    //   FIX: https://github.com/jaredhanson/passport-oauth/issues/16
    if (req.query && req.query.error_code && !req.query.error) {
      throw new FacebookAuthorizationError(
        'FB:' + req.query.error_code,
        req.query.error_message,
      );
    }

    const {
      accessToken,
      refreshToken,
      state,
    } = await this._oauth.completeAuthentication(req, res);
    const {profile, rawProfile} = await this.getUserProfile(
      accessToken,
      options,
    );
    return {accessToken, refreshToken, profile, rawProfile, state};
  }
}

/**
 * Return extra Facebook-specific parameters to be included in the authorization
 * request.
 */
function authorizationParams<State>(options: InitOptions<State>) {
  const params: {[key: string]: string} = {};

  // https://developers.facebook.com/docs/reference/dialogs/oauth/
  if (options.display) {
    params.display = options.display;
  }

  // https://developers.facebook.com/docs/facebook-login/reauthentication/
  if (options.isReRequest) {
    params.auth_type = 'rerequest';
  }

  return params;
}

module.exports = FacebookAuthentication;
module.exports.default = FacebookAuthentication;
