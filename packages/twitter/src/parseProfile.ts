import {Profile} from '@authentication/types';
import RawProfile from './RawProfile';

export default function parseProfile(json: RawProfile): Profile {
  const originalProfileURL = json.profile_image_url_https.replace(
    /\_normal/,
    '',
  );
  const getProfileURL = (size: 'mini' | 'normal' | 'bigger') =>
    json.profile_image_url_https.replace(/\_normal/, '_' + size);

  return {
    provider: 'twitter',
    id: json.id_str || json.id.toString(10),
    displayName: json.name || json.screen_name,
    userName: json.screen_name,
    emails: json.email ? [{value: json.email}] : [],
    images: [
      {url: originalProfileURL},
      {url: getProfileURL('bigger'), size: 73},
      {url: getProfileURL('normal'), size: 48},
      {url: getProfileURL('mini'), size: 24},
    ],
  };
}
