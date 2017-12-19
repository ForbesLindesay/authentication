import {Profile} from '@authentication/types';
import RawGitHubProfile from './RawGitHubProfile';
import RawEmail from './RawEmail';
/**
 * Parse profile.
 *
 * Parses user profiles as fetched from GitHub's API
 *
 * References:
 *   - https://developer.github.com/v3/users/#get-the-authenticated-user
 *   - https://developer.github.com/v3/users/emails/
 */
export default function parseProfile(
  json: RawGitHubProfile,
  emails: null | RawEmail[],
) {
  const profile: Profile = {
    provider: 'github',
    id: json.id,
    displayName: json.name,
    userName: json.login,
    emails: [],
    images: json.avatar_url ? [{url: json.avatar_url}] : [],
    image: json.avatar_url ? {url: json.avatar_url} : undefined,
  };

  if (typeof profile.id !== 'string' && typeof profile.id !== 'number') {
    throw new TypeError(
      'profile.id should always be either a string or a number',
    );
  }
  if (typeof profile.displayName !== 'string') {
    throw new TypeError('profile.displayName should be a string');
  }
  if (emails) {
    emails.forEach(email => {
      if (email.verified) {
        profile.emails.push({
          value: email.email,
          type:
            email.visibility !== 'public'
              ? 'private'
              : email.primary ? 'primary' : 'secondary',
        });
      }
    });
  }
  if (profile.emails.some(e => typeof e.value !== 'string')) {
    throw new TypeError('Every email in profile.emails should have a `value`');
  }

  return profile;
}
