import {URL} from 'url';
import {Request, Response, NextFunction} from 'express';
import OAuth2Authentication from '@authentication/oauth2';
import {Mixed, Profile, RedirectStrategy} from '@authentication/types';
import Stripe = require('stripe');
import parseProfile from './parseProfile';

export type RawProfile = Stripe.accounts.IAccount;

export {Profile};
export interface Options {
  clientID?: string;
  secretKey?: string;
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
   * See: https://stripe.com/docs/connect/oauth-reference#get-authorize-request
   * Defaults to read_only
   */
  scope?: 'read_only' | 'read_write';
  state?: State;
  /**
   * Defaults to login for scope read_only and register for scope read_write.
   */
  stripeLanding?: 'login' | 'register';
  /**
   * Boolean to indicate that the user should always be asked to connect, even if they're already connected.
   *
   * Defaults to false.
   */
  alwaysPrompt?: boolean;

  registrationDefaults?: RegistrationDefaults;
}
export interface RegistrationDefaults {
  email?: string;
  url?: string;
  /**
   * Two-letter country code (e.g., US or CA).
   */
  country?: string;
  phoneNumber?: string;
  businessName?: string;
  businessType?:
    | 'sole_prop'
    | 'corporation'
    | 'non_profit'
    | 'partnership'
    | 'llc';
  firstName?: string;
  lastName?: string;
  dateOfBirth?: {day: number; month: number; year: number};
  address?: {
    street?: string;
    city?: string;
    // Must be the two-letter state or province code
    // (e.g., NY for a U.S. business or AB for a Canadian one).
    state?: string;
    zip?: string;
  };
  physicalProduct?: boolean;
  shippingDays?: number;
  productCategory?:
    | 'art_and_graphic_design'
    | 'advertising'
    | 'charity'
    | 'clothing_and_accessories'
    | 'consulting'
    | 'clubs_and_membership_organizations'
    | 'education'
    | 'events_and_ticketing'
    | 'food_and_restaurants'
    | 'software'
    | 'professional_services'
    | 'tourism_and_travel'
    | 'web_development'
    | 'other';
  productDescription?: string;
  /**
   * Ingeger in **Dollars**
   */
  averagePayment?: number;
  /**
   * The estimated past year's volume for the business. Must be an integer in dollar
   */
  pastYearVolume?: number;
  /**
   * Three-letter ISO code representing currency,
   *
   * Must prefill stripe_user[country] with the corresponding country.
   */
  currency?: string;
}

/**
 * The Stripe authentication strategy authenticates requests by delegating to
 * Stripe using the OAuth 2.0 protocol for connect.
 */
export default class StripeAuthentication<State = Mixed>
  implements RedirectStrategy<State, InitOptions<State>, {}> {
  private readonly _oauth: OAuth2Authentication<
    State,
    {
      token_type: 'bearer';
      stripe_publishable_key: string;
      scope: 'read_write' | 'read_only';
      livemode: boolean;
      stripe_user_id: string;
    }
  >;
  public readonly stripe: Stripe;
  public readonly callbackPath: string;
  constructor(options: Options) {
    const clientID =
      options.clientID === undefined
        ? process.env.STRIPE_CONNECT_CLIENT_ID
        : options.clientID;
    const clientSecret =
      options.secretKey === undefined
        ? process.env.STRIPE_SECRET_KEY
        : options.secretKey;
    if (!clientID) {
      throw new Error(
        'You must either specify the `clientID` option when constructing StripeAuthentication or set the STRIPE_CONNECT_CLIENT_ID environment variable. ' +
          'You can get the Client ID from https://dashboard.stripe.com/account/applications/settings',
      );
    }
    if (!/^ca_/.test(clientID)) {
      throw new Error(
        'This stripe connect client id is invalid. It should start with "ca_". ' +
          'You can get the Client ID from https://dashboard.stripe.com/account/applications/settings',
      );
    }
    if (!clientSecret) {
      throw new Error(
        'You must either specify the `secretKey` option when constructing StripeAuthentication or set the STRIPE_SECRET_KEY environment variable. ' +
          'You can get the Secret Key from https://dashboard.stripe.com/account/apikeys',
      );
    }
    if (/^pk_/.test(clientSecret)) {
      throw new Error(
        'You seem to have used a publishable key instead of the secret key for stripe. ' +
          'You can get the Secret Key from https://dashboard.stripe.com/account/apikeys',
      );
    }
    if (!/^sk_.+/.test(clientSecret)) {
      throw new Error(
        'This stripe secret key is invalid. It should start with "sk_". ' +
          'You can get the Secret Key from https://dashboard.stripe.com/account/apikeys',
      );
    }
    this.stripe = new Stripe(clientSecret);
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
      authorizeURL: new URL('https://connect.stripe.com/oauth/authorize'),
      accessTokenURL: new URL('https://connect.stripe.com/oauth/token'),
      callbackURL: options.callbackURL,
      trustProxy: options.trustProxy,
    });
  }

  /**
   * Retrieve user profile from Stripe.
   *
   * This function constructs a normalized profile
   */
  async getUserProfile(stripeAccountID: string) {
    const rawProfile = await this.stripe.accounts.retrieve(stripeAccountID);

    return {profile: parseProfile(stripeAccountID, rawProfile), rawProfile};
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
      scope: options.scope,
      state: options.state,
      params: authorizationParams(options),
    });
  }
  async completeAuthentication(req: Request, res: Response) {
    const {
      accessToken,
      refreshToken,
      results,
      state,
    } = await this._oauth.completeAuthentication(req, res);

    const {profile, rawProfile} = await this.getUserProfile(
      results.stripe_user_id,
    );
    return {
      accessToken,
      refreshToken,
      stripeUserID: results.stripe_user_id,
      stripePublishableKey: results.stripe_publishable_key,
      scope: results.scope,
      livemode: results.livemode,
      profile,
      rawProfile,
      state,
    };
  }
}

/**
 * Return extra Stripe-specific parameters to be included in the authorization
 * request.
 */
function authorizationParams<State>(options: InitOptions<State>) {
  const params: {[key: string]: string} = {};

  if (options.stripeLanding) {
    params.stripe_landing = options.stripeLanding;
  }

  if (options.alwaysPrompt) {
    params.always_prompt = 'true';
  }

  if (options.registrationDefaults) {
    if (options.registrationDefaults.email) {
      params['stripe_user[email]'] = options.registrationDefaults.email;
    }
    if (options.registrationDefaults.url) {
      params['stripe_user[url]'] = options.registrationDefaults.url;
    }
    if (options.registrationDefaults.country) {
      if (!/^[a-z][a-z]$/i.test(options.registrationDefaults.country)) {
        throw new Error(
          'Expected user country code to be a two-letter country code (e.g. US or CA) but got ' +
            JSON.stringify(options.registrationDefaults.country),
        );
      }
      params[
        'stripe_user[country]'
      ] = options.registrationDefaults.country.toUpperCase();
    }
    if (options.registrationDefaults.phoneNumber) {
      params['stripe_user[phone_number]'] =
        options.registrationDefaults.phoneNumber;
    }
    if (options.registrationDefaults.businessName) {
      params['stripe_user[business_name]'] =
        options.registrationDefaults.businessName;
    }
    if (options.registrationDefaults.businessType) {
      params['stripe_user[business_type]'] =
        options.registrationDefaults.businessType;
    }
    if (options.registrationDefaults.firstName) {
      params['stripe_user[first_name]'] =
        options.registrationDefaults.firstName;
    }
    if (options.registrationDefaults.lastName) {
      params['stripe_user[last_name]'] = options.registrationDefaults.lastName;
    }
    if (options.registrationDefaults.dateOfBirth) {
      params['stripe_user[dob_day]'] =
        '' + options.registrationDefaults.dateOfBirth.day;
      params['stripe_user[dob_month]'] =
        '' + options.registrationDefaults.dateOfBirth.month;
      params['stripe_user[dob_year]'] =
        '' + options.registrationDefaults.dateOfBirth.year;
    }
    if (options.registrationDefaults.address) {
      if (options.registrationDefaults.address.street) {
        params['stripe_user[street_address]'] =
          options.registrationDefaults.address.street;
      }
      if (options.registrationDefaults.address.city) {
        params['stripe_user[city]'] = options.registrationDefaults.address.city;
      }
      if (options.registrationDefaults.address.state) {
        if (!/^[a-z][a-z]$/i.test(options.registrationDefaults.address.state)) {
          throw new Error(
            'Expected user address state to be a two-letter state code (e.g. NY or AB) but got ' +
              JSON.stringify(options.registrationDefaults.address.state),
          );
        }
        if (!options.registrationDefaults.country) {
          throw new Error(
            "You must specify the country if you are specifying a user's state",
          );
        }
        params[
          'stripe_user[state]'
        ] = options.registrationDefaults.address.state.toUpperCase();
      }
      if (options.registrationDefaults.address.zip) {
        params['stripe_user[zip]'] = options.registrationDefaults.address.zip;
      }
    }
    if (options.registrationDefaults.physicalProduct !== undefined) {
      params['stripe_user[physical_product]'] = options.registrationDefaults
        .physicalProduct
        ? 'true'
        : 'false';
    }
    if (options.registrationDefaults.shippingDays) {
      params['stripe_user[shipping_days]'] =
        '' + options.registrationDefaults.shippingDays;
    }
    if (options.registrationDefaults.productCategory) {
      params['stripe_user[product_category]'] =
        options.registrationDefaults.productCategory;
    }
    if (options.registrationDefaults.productDescription) {
      params['stripe_user[product_description]'] =
        options.registrationDefaults.productDescription;
    }
    if (options.registrationDefaults.averagePayment) {
      params['stripe_user[average_payment]'] =
        '' + options.registrationDefaults.averagePayment;
    }
    if (options.registrationDefaults.pastYearVolume) {
      params['stripe_user[past_year_volume]'] =
        '' + options.registrationDefaults.pastYearVolume;
    }
    if (options.registrationDefaults.currency) {
      if (!/^[a-z][a-z][a-z]$/i.test(options.registrationDefaults.currency)) {
        throw new Error(
          'Expected user currency to be a trhee-letter ISO 4217 code (e.g. usd or gbp) but got ' +
            JSON.stringify(options.registrationDefaults.currency),
        );
      }
      params[
        'stripe_user[currency]'
      ] = options.registrationDefaults.currency.toLowerCase();
    }
  }

  return params;
}

module.exports = StripeAuthentication;
module.exports.default = StripeAuthentication;
