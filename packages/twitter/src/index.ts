import {URL} from 'url';
import {Request, Response, NextFunction} from 'express';
import OAuth1Authentication from '@authentication/oauth1';
import {Mixed, Profile, RedirectStrategy} from '@authentication/types';
import RawProfile from './RawProfile';
import parseProfile from './parseProfile';

const userProfileURL = new URL(
  'https://api.twitter.com/1.1/account/verify_credentials.json',
);

export {Profile};

export interface Options {
  callbackURL: string | URL;
  consumerKey?: string;
  consumerSecret?: string;
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
  trustProxy?: boolean;
  /**
   * The "Request email addresses from users" checkbox is available
   * under the app permissions on apps.twitter.com. Privacy Policy
   * URL and Terms of Service URL fields must be completed in the
   * app settings in order for email address access to function.
   * If enabled, users will be informed via the oauth/authorize
   * dialog that your app can access their email address.
   */
  includeEmail?: boolean;
  includeStatus?: boolean;
  includeEntities?: boolean;
}
export interface InitOptions<State> {
  state?: State;
  /**
   * Forces the user to enter their credentials to ensure the correct
   * users account is authorized.
   */
  forceLogin?: boolean;
  /**
   * Prefills the username input box of the OAuth login screen with
   * the given value.
   */
  screenName?: string;
}
export default class TwitterAuthentication<State = Mixed>
  implements RedirectStrategy<State, InitOptions<State>> {
  private readonly _oauth: OAuth1Authentication<State>;
  private readonly _includeEmail: boolean;
  private readonly _includeStatus: boolean;
  private readonly _includeEntities: boolean;
  public readonly callbackPath: string;
  constructor(options: Options) {
    if (!options.cookieKeys && !process.env.SECURE_KEY) {
      throw new Error(
        'You must either pass in `cookieKeys` or set SECURE_KEY to use twitter authentication',
      );
    }
    const consumerKey =
      options.consumerKey === undefined
        ? process.env.TWITTER_CONSUMER_KEY
        : options.consumerKey;
    const consumerSecret =
      options.consumerSecret === undefined
        ? process.env.TWITTER_CONSUMER_SECRET
        : options.consumerSecret;
    if (!consumerKey) {
      throw new Error(
        'You must either specify the `consumerKey` option when constructing TwitterAuthentication or set the TWITTER_CONSUMER_KEY environment variable. You can aquire keys at https://apps.twitter.com/',
      );
    }
    if (!consumerSecret) {
      throw new Error(
        'You must either specify the `consumerSecret` option when constructing TwitterAuthentication or set the TWITTER_CONSUMER_SECRET environment variable. You can aquire keys at https://apps.twitter.com/',
      );
    }
    this._oauth = new OAuth1Authentication({
      callbackURL: options.callbackURL,
      consumerKey,
      consumerSecret,
      requestTokenURL: new URL('https://api.twitter.com/oauth/request_token'),
      accessTokenURL: new URL('https://api.twitter.com/oauth/access_token'),
      userAuthorizationURL: new URL(
        'https://api.twitter.com/oauth/authenticate',
      ),
      cookieKeys: options.cookieKeys,
      cookieName: options.cookieName,
      trustProxy: options.trustProxy,
    });
    this._includeEmail =
      options.includeEmail !== undefined ? options.includeEmail : false;
    this._includeStatus =
      options.includeStatus !== undefined ? options.includeStatus : true;
    this._includeEntities =
      options.includeEntities !== undefined ? options.includeEntities : true;
    this.callbackPath = this._oauth.callbackPath;
  }
  async userProfile(token: string, tokenSecret: string) {
    const url = new URL(userProfileURL.href);
    if (this._includeEmail === true) {
      url.searchParams.set('include_email', 'true');
    }
    if (this._includeStatus === false) {
      url.searchParams.set('skip_status', 'true');
    }
    if (this._includeEntities === false) {
      url.searchParams.set('include_entities', 'false');
    }
    const {body, res} = await this._oauth.get(url, token, tokenSecret);

    let json = null;
    try {
      json = JSON.parse(body);
    } catch (ex) {
      throw new Error('Failed to parse user profile');
    }

    const profile = parseProfile(json);
    // NOTE: The "X-Access-Level" header is described here:
    //       https://dev.twitter.com/oauth/overview/application-permission-model
    //       https://dev.twitter.com/oauth/overview/application-permission-model-faq
    const accessLevel: 'read' | 'read-write' | 'read-write-directmessages' =
      res.headers['x-access-level'];
    return {profile, accessLevel, rawProfile: json as RawProfile};
  }
  userCancelledLogin(req: Request) {
    return !!(req.query && req.query.denied);
  }
  isCallbackRequest(req: Request): boolean {
    return this._oauth.isCallbackRequest(req);
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
    const userAuthorizationParams: {[name: string]: string} = {};
    if (options.forceLogin) {
      userAuthorizationParams.force_login = 'true';
    }
    if (options.screenName) {
      userAuthorizationParams.screen_name = options.screenName;
    }
    this._oauth.redirectToProvider(req, res, next, {
      state: options.state,
      userAuthorizationParams,
    });
  }
  async completeAuthentication(req: Request, res: Response) {
    const {
      token,
      tokenSecret,
      state,
    } = await this._oauth.completeAuthentication(req, res);
    const {profile, rawProfile, accessLevel} = await this.userProfile(
      token,
      tokenSecret,
    );
    return {token, tokenSecret, profile, rawProfile, accessLevel, state};
  }
}
