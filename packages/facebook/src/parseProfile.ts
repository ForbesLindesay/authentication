import {Profile} from '@authentication/types';

const pictures = [
  'picture',
  'picture_large',
  'picture_medium',
  'picture_small',
];

/**
 * Parse profile.
 *
 * References:
 *   - https://developers.facebook.com/docs/graph-api/reference/user/
 */
export default function parseProfile(json: any) {
  var profile: Profile = {
    provider: 'facebook',
    id: json.id,
    emails: json.email ? [{value: json.email}] : [],
    userName: json.username,
    displayName: json.name,
    name: {
      familyName: json.last_name,
      givenName: json.first_name,
      middleName: json.middle_name,
    },
    gender: json.gender,
    url: json.link,
  };

  profile.images = [];
  pictures.forEach(size => {
    if (json[size] && !json[size].data.is_silhouette) {
      profile.images!.push({
        url: json[size].data.url,
        size: Math.min(json[size].data.height, json[size].data.width),
      });
    }
  });

  return profile;
}
