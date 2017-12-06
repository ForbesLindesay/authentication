import {IncomingMessage} from 'http';
import {URL} from 'url';

export function isCrossOrigin(
  header: string | string[] | void,
  req: IncomingMessage,
  baseURL: void | URL,
) {
  if (!header) {
    return false;
  }

  const actual = new URL(header + '');

  // in production, it must match the explicitly supplied origin
  if (baseURL && actual.origin === baseURL.origin) {
    return false;
  }

  // in development or when no explicit baseURL is provided, it
  // can match either the host, or the x-forwarded-host
  if (process.env.NODE_ENV === 'development' || !baseURL) {
    if (actual.origin === actual.protocol + '//' + req.headers.host) {
      return false;
    }
    if (
      actual.origin ===
      actual.protocol + '//' + req.headers['x-forwarded-host']
    ) {
      return false;
    }
  }

  return true;
}
export default function isSameOrigin(
  req: IncomingMessage,
  baseURL: void | URL,
) {
  return (
    (req.headers.referer || req.headers.origin) &&
    !isCrossOrigin(req.headers.referer, req, baseURL) &&
    !isCrossOrigin(req.headers.origin, req, baseURL)
  );
}
