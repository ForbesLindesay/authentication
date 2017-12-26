import {Profile} from '@authentication/types';
import RawProfile from './RawProfile';

export default function parseProfile(json: RawProfile): Profile {
  return {
    provider: 'tumblr',
    id: json.name,
    displayName: json.name,
    userName: json.name,
    emails: [],
    images: [],
  };
}
