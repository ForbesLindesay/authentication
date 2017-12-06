import {URL} from 'url';

export default function isSameOrigin(baseURL: void | string | URL): void | URL {
  const withEnvironment =
    baseURL || process.env.BASE_URL || process.env.BASE_URI;
  return typeof withEnvironment === 'string'
    ? new URL(withEnvironment)
    : withEnvironment;
}
