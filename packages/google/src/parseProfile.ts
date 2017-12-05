import {Profile} from '@authentication/types';
import RawGoogleProfile from './RawGoogleProfile';
/**
 * Parse profile.
 *
 * Parses user profiles as fetched from Google's Google+ API.
 *
 * The amount of detail in the profile varies based on the scopes granted by the
 * user.  The following scope values add additional data:
 *
 *     `https://www.googleapis.com/auth/plus.login` - recommended login scope
 *     `profile` - basic profile information
 *     `email` - email address
 *
 * References:
 *   - https://developers.google.com/+/web/api/rest/latest/people/get
 *   - https://developers.google.com/+/web/api/rest/
 *   - https://developers.google.com/+/web/api/rest/oauth
 */
export default function parseProfile(json: RawGoogleProfile) {
  const profile: Profile = {
    ...json,
    provider: 'google',
    emails: json.emails || [],
  };
  if (typeof profile.id !== 'string' && typeof profile.id !== 'number') {
    throw new TypeError(
      'profile.id should always be either a string or a number',
    );
  }
  if (typeof profile.displayName !== 'string') {
    throw new TypeError('profile.displayName should be a string');
  }
  if (profile.emails.some(e => typeof e.value !== 'string')) {
    throw new TypeError('Every email in profile.emails should have a `value`');
  }
  if (profile.image && profile.image.url) {
    profile.images = [profile.image];
    profile.image.sizeParameter = 'sz';
  }

  return profile;
}
