import {IncomingMessage, ServerResponse} from 'http';
import {URL} from 'url';

export type ErrorHandler<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse extends ServerResponse = ServerResponse,
> = (
  req: TRequest,
  res: TResponse,
  next: (err?: any) => any,
  headers: {host: string; referer?: URL; origin?: URL},
) => any;
export interface Options<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse extends ServerResponse = ServerResponse,
> {
  errorHandler?: ErrorHandler<TRequest, TResponse>;
  host?: string;
  ignoreMethods?: ReadonlyArray<string>;
}

export enum MatchResultKind {
  OK,
  MISSING_HOST,
  HEADER_MISMATCH,
}
export type MatchResult =
  | {kind: MatchResultKind.OK | MatchResultKind.MISSING_HOST}
  | {
      kind: MatchResultKind.HEADER_MISMATCH;
      host: string;
      referer?: URL;
      origin?: URL;
    };
export function getMatcher(host?: string) {
  const trueHost = host || getHostFromEnvironment();
  return (req: IncomingMessage, res: ServerResponse): MatchResult => {
    const host = trueHost || req.headers.host;
    if (!host) {
      return {kind: MatchResultKind.MISSING_HOST};
    }
    // N.B. Only trust headers in:
    //  https://tinyurl.com/forbidden-header-names
    // other headers can be maliciously modified by attackers
    const referer = req.headers.referer && new URL(req.headers.referer + '');
    if (referer && host === referer.host) {
      return {kind: MatchResultKind.OK};
    }

    const origin = req.headers.origin && new URL(req.headers.origin + '');
    if (origin && host === origin.host) {
      return {kind: MatchResultKind.OK};
    }
    return {
      kind: MatchResultKind.HEADER_MISMATCH,
      host,
      referer: referer || undefined,
      origin: origin || undefined,
    };
  };
}
export default function csrfProtection<
  TRequest extends IncomingMessage = IncomingMessage,
  TResponse extends ServerResponse = ServerResponse,
>(options: Options<TRequest, TResponse> = {}) {
  const ignoreMethods = options.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'];
  const matcher = getMatcher(options.host);
  return function csrfRequestHandler(
    req: TRequest,
    res: TResponse,
    next: (err?: any) => any,
  ): void {
    if (req.method && ignoreMethods.indexOf(req.method) !== -1) {
      return next();
    }
    const result = matcher(req, res);
    switch (result.kind) {
      case MatchResultKind.OK:
        next();
        return;
      case MatchResultKind.MISSING_HOST:
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end(`CSRF Protection Errored: missing "host" header`);
        return;
      case MatchResultKind.HEADER_MISMATCH:
        if (options.errorHandler) {
          options.errorHandler(req, res, next, {
            host: result.host,
            referer: result.referer,
            origin: result.origin,
          });
          return;
        }
        res.statusCode = 403;
        res.setHeader('Content-Type', 'text/plain');
        res.end(
          `CSRF Protection Errored: referer and origin do not match host:
  hostname: ${result.host}
  referer: ${result.referer ? result.referer.host : 'NONE'}
  origin: ${result.origin ? result.origin.host : 'NONE'}
`,
        );
    }
  };
}

function getHostFromEnvironment(): undefined | string {
  const baseURL = process.env.BASE_URL || process.env.BASE_URI;
  if (typeof baseURL === 'string') {
    try {
      return new URL(baseURL).host;
    } catch (ex: any) {
      throw new Error(
        `Error parsing ${
          process.env.BASE_URL ? 'BASE_URL' : 'BASE_URI'
        } environment variable: ${ex.message || ex}`,
      );
    }
  }
  return undefined;
}

module.exports = csrfProtection;
module.exports.default = csrfProtection;
module.exports.getMatcher = getMatcher;
