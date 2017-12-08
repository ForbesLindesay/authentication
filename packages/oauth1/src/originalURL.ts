import {IncomingMessage} from 'http';
import {URL} from 'url';
/**
 * Reconstructs the original URL of the request.
 *
 * This function builds a URL that corresponds the original URL requested by the
 * client, including the protocol (http or https) and host.
 *
 * If the request passed through any proxies that terminate SSL, the
 * `X-Forwarded-Proto` header is used to detect if the request was encrypted to
 * the proxy, assuming that the proxy has been flagged as trusted.
 */
export default function originalURL(
  req: IncomingMessage,
  options: {trustProxy?: boolean | void | undefined} = {},
): URL {
  const app = (req as any).app;
  if (app && app.get && app.get('trust proxy')) {
    options.trustProxy = true;
  }
  const trustProxy =
    typeof options.trustProxy === 'boolean'
      ? options.trustProxy
      : !!(app && app.get && app.get('trust proxy')) ||
        process.env.NODE_ENV === 'development';

  const proto = ('' + (req.headers['x-forwarded-proto'] || '')).toLowerCase();
  const tls: boolean =
    (req.connection as any).encrypted ||
    (trustProxy && 'https' == proto.split(/\s*,\s*/)[0]);
  const host =
    (trustProxy && req.headers['x-forwarded-host']) || req.headers.host;
  const protocol = tls ? 'https' : 'http';
  const path = req.url || '';
  return new URL(protocol + '://' + host + path);
}
