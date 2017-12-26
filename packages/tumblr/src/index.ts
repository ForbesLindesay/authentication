import {URL} from 'url';
import {Request, Response, NextFunction} from 'express';
import OAuth1Authentication from '@authentication/oauth1';
import {Mixed, Profile, RedirectStrategy} from '@authentication/types';
import RawProfile from './RawProfile';
import parseProfile from './parseProfile';

const userProfileURL = new URL('http://api.tumblr.com/v2/user/info');

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
}
export interface InitOptions<State> {
  state?: State;
}
export default class TumblrAuthentication<State = Mixed>
  implements RedirectStrategy<State, InitOptions<State>> {
  private readonly _oauth: OAuth1Authentication<State>;
  public readonly callbackPath: string;
  constructor(options: Options) {
    const consumerKey =
      options.consumerKey === undefined
        ? process.env.TUMBLR_CONSUMER_KEY
        : options.consumerKey;
    const consumerSecret =
      options.consumerSecret === undefined
        ? process.env.TUMBLR_CONSUMER_SECRET
        : options.consumerSecret;
    if (!consumerKey) {
      throw new Error(
        'You must either specify the `consumerKey` option when constructing TumblrAuthentication or set the TUMBLR_CONSUMER_KEY environment variable. You can aquire keys at https://www.tumblr.com/oauth/apps',
      );
    }
    if (!consumerSecret) {
      throw new Error(
        'You must either specify the `consumerSecret` option when constructing TumblrAuthentication or set the TUMBLR_CONSUMER_SECRET environment variable. You can aquire keys at https://www.tumblr.com/oauth/apps',
      );
    }
    this._oauth = new OAuth1Authentication({
      callbackURL: options.callbackURL,
      consumerKey,
      consumerSecret,
      requestTokenURL: new URL('http://www.tumblr.com/oauth/request_token'),
      accessTokenURL: new URL('http://www.tumblr.com/oauth/access_token'),
      userAuthorizationURL: new URL('http://www.tumblr.com/oauth/authorize'),
      cookieKeys: options.cookieKeys,
      cookieName: options.cookieName,
      trustProxy: options.trustProxy,
    });
    this.callbackPath = this._oauth.callbackPath;
  }
  async userProfile(token: string, tokenSecret: string) {
    const url = new URL(userProfileURL.href);
    const {body} = await this._oauth.get(url, token, tokenSecret);

    let json = null;
    try {
      json = JSON.parse(body).response.user;
    } catch (ex) {
      throw new Error('Failed to parse user profile');
    }

    const profile = parseProfile(json);
    return {profile, rawProfile: json as RawProfile};
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
    this._oauth.redirectToProvider(req, res, next, {
      state: options.state,
    });
  }
  async completeAuthentication(req: Request, res: Response) {
    const {
      token,
      tokenSecret,
      state,
    } = await this._oauth.completeAuthentication(req, res);
    const {profile, rawProfile} = await this.userProfile(token, tokenSecret);
    return {token, tokenSecret, profile, rawProfile, state};
  }
}
