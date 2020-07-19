import JsonValue, {JsonObject} from './JsonValue';
import {
  strToUrlBase64,
  strToUint8,
  uint8ToUrlBase64,
  urlBase64ToUint8,
  urlBase64ToString,
} from './web-utils';
import validator from './validator';

export interface JsonWebKeyPrivate {
  kty: 'EC'; // we only support EC keys
  crv: string; // e.g. P-256
  x: string;
  y: string;
  d: string;
}

export function isValidPrivateKey(value: unknown): value is JsonWebKeyPrivate {
  if (typeof value !== 'object' || !value) return false;
  const v = value as {[key: string]: unknown};

  return (
    v.kty === 'EC' &&
    typeof v.crv === 'string' &&
    typeof v.x === 'string' &&
    typeof v.y === 'string' &&
    typeof v.d === 'string'
  );
}

export interface JsonWebKeyPublic {
  kty: 'EC'; // we only support EC keys
  crv: string; // e.g. P-256
  x: string;
  y: string;
  d?: undefined;
}

export function isValidPublicKey(value: unknown): value is JsonWebKeyPublic {
  if (typeof value !== 'object' || !value) return false;
  const v = value as {[key: string]: unknown};

  return (
    v.kty === 'EC' &&
    typeof v.crv === 'string' &&
    typeof v.x === 'string' &&
    typeof v.y === 'string' &&
    typeof v.d === 'undefined'
  );
}

export interface JsonWebTokenPayload {
  /**
   * The "iss" (issuer) claim identifies the principal that issued the
   * JWT.  The processing of this claim is generally application specific.
   * The "iss" value is a case-sensitive string containing a StringOrURI
   * value.  Use of this claim is OPTIONAL.
   */
  iss?: string;
  /**
   * The "sub" (subject) claim identifies the principal that is the
   * subject of the JWT.  The claims in a JWT are normally statements
   * about the subject.  The subject value MUST either be scoped to be
   * locally unique in the context of the issuer or be globally unique.
   * The processing of this claim is generally application specific.  The
   * "sub" value is a case-sensitive string containing a StringOrURI
   * value.  Use of this claim is OPTIONAL.
   */
  sub?: string;
  /**
   * The "aud" (audience) claim identifies the recipients that the JWT is
   * intended for.  Each principal intended to process the JWT MUST
   * identify itself with a value in the audience claim.  If the principal
   * processing the claim does not identify itself with a value in the
   * "aud" claim when this claim is present, then the JWT MUST be
   * rejected.  In the general case, the "aud" value is an array of case-
   * sensitive strings, each containing a StringOrURI value.  In the
   * special case when the JWT has one audience, the "aud" value MAY be a
   * single case-sensitive string containing a StringOrURI value.  The
   * interpretation of audience values is generally application specific.
   * Use of this claim is OPTIONAL.
   */
  aud?: string;
  /**
   * The "exp" (expiration time) claim identifies the expiration time on
   * or after which the JWT MUST NOT be accepted for processing.  The
   * processing of the "exp" claim requires that the current date/time
   * MUST be before the expiration date/time listed in the "exp" claim.
   * Implementers MAY provide for some small leeway, usually no more than
   * a few minutes, to account for clock skew.  Its value MUST be a number
   * containing a NumericDate value.  Use of this claim is OPTIONAL.
   */
  exp?: number;
  /**
   * The "nbf" (not before) claim identifies the time before which the JWT
   * MUST NOT be accepted for processing.  The processing of the "nbf"
   * claim requires that the current date/time MUST be after or equal to
   * the not-before date/time listed in the "nbf" claim.  Implementers MAY
   * provide for some small leeway, usually no more than a few minutes, to
   * account for clock skew.  Its value MUST be a number containing a
   * NumericDate value.  Use of this claim is OPTIONAL.
   */
  nbf?: number;
  /**
   * The "iat" (issued at) claim identifies the time at which the JWT was
   * issued.  This claim can be used to determine the age of the JWT.  Its
   * value MUST be a number containing a NumericDate value.  Use of this
   * claim is OPTIONAL.
   */
  iat?: number;
  /**
   * The "jti" (JWT ID) claim provides a unique identifier for the JWT.
   * The identifier value MUST be assigned in a manner that ensures that
   * there is a negligible probability that the same value will be
   * accidentally assigned to a different data object; if the application
   * uses multiple issuers, collisions MUST be prevented among values
   * produced by different issuers as well.  The "jti" claim can be used
   * to prevent the JWT from being replayed.  The "jti" value is a case-
   * sensitive string.  Use of this claim is OPTIONAL.
   */
  jti?: string;

  [key: string]: JsonValue | undefined;
}

const validatePayload: (
  value: JsonObject,
) =>
  | {
      valid: false;
      reason: string;
    }
  | {
      valid: true;
      value: JsonWebTokenPayload;
    } = validator()
  .string('iss')
  .string('sub')
  .string('aud')
  .number('exp')
  .number('nbf')
  .number('iat')
  .string('jti');

/**
 * Generate a private JsonWebKey. This key should be stored
 * on whichever device needs to be able to sign JWTs.
 *
 * N.B. DO NOT SHARE THIS KEY!
 */
export async function generatePrivateKey(): Promise<JsonWebKeyPrivate> {
  const exportable = true;
  const key = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    exportable,
    ['sign'],
  );
  const k = await crypto.subtle.exportKey('jwk', key.privateKey);
  if (k.kty !== 'EC') {
    throw new Error('Expected k.kty to be EC');
  }
  return {
    kty: 'EC',
    crv: k.crv!,
    d: k.d!,
    x: k.x!,
    y: k.y!,
  };
}

/**
 * The thumbprint is a short hash of the public key.
 * It can be safely shared publicly, and used to identify
 * the correct public key to use.
 */
export function jwkThumbprint(jwk: JsonWebKeyPrivate) {
  // lexigraphically sorted, no spaces
  var sortedPub = '{"crv":CRV,"kty":"EC","x":X,"y":Y}'
    .replace('CRV', JSON.stringify(jwk.crv))
    .replace('X', JSON.stringify(jwk.x))
    .replace('Y', JSON.stringify(jwk.y));

  // The hash should match the size of the key,
  // but we're only dealing with P-256
  return crypto.subtle
    .digest({name: 'SHA-256'}, strToUint8(sortedPub))
    .then(function (hash) {
      return uint8ToUrlBase64(new Uint8Array(hash));
    });
}

/**
 * Extract the public key from a private JsonWebKey.
 * This public key is safe to share.
 */
export function getPublicKey(
  jwkPrivateKey: JsonWebKeyPrivate,
): JsonWebKeyPublic {
  return {
    kty: jwkPrivateKey.kty,
    crv: jwkPrivateKey.crv,
    x: jwkPrivateKey.x,
    y: jwkPrivateKey.y,
    // key_ops: ['verify'],
  };
}

export async function jwtSign(
  jwk: JsonWebKeyPrivate,
  {
    headers,
    payload,
  }: {
    headers?: JsonObject;
    payload: JsonWebTokenPayload;
  },
): Promise<string> {
  const validated = validatePayload(payload);
  if (!validated.valid) {
    throw new Error(validated.reason);
  }
  // JWT "headers" really means JWS "headersStr headers"
  const headersStr = strToUrlBase64(
    JSON.stringify({
      ...headers,
      typ: 'JWT',
      alg: 'ES256',
    }),
  );
  const payloadStr = strToUrlBase64(JSON.stringify(payload));

  // To make re-exportable as JSON (or DER/PEM)
  var exportable = true;
  const privateKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      // To import as EC (ECDSA, P-256, SHA-256, ES256)
      name: 'ECDSA',
      namedCurve: 'P-256',
      hash: {name: 'SHA-256'},
    },
    exportable,
    ['sign'],
  );

  // The signature and hash should match the bit-entropy of the key
  // https://tools.ietf.org/html/rfc7518#section-3
  const signature = await crypto.subtle.sign(
    {name: 'ECDSA', hash: {name: 'SHA-256'}},
    privateKey,
    strToUint8(headersStr + '.' + payloadStr),
  );

  // returns an ArrayBuffer containing a JOSE (not X509) signature,
  // which must be converted to Uint8 to be useful
  const signatureStr = uint8ToUrlBase64(new Uint8Array(signature));

  // JWT is just a "compressed", "headersStr" JWS
  return `${headersStr}.${payloadStr}.${signatureStr}`;
}

export async function jwtVerify(
  jwk: JsonWebKeyPublic,
  jwt: string,
  allowLists: {
    iss?: AllowList;
    sub?: AllowList;
    aud?: AllowList;
    jti?: AllowList;
  } = {},
) {
  const tokenParts = jwt.split('.');

  if (tokenParts.length !== 3) {
    return {
      verified: false,
      reason: 'JSON Web Tokens must consist of 3 parts separated by "."',
    };
  }

  const [headersStr, payloadStr, signatureStr] = tokenParts;

  const exportable = true;
  const publicKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    {
      // To import as EC (ECDSA, P-256, SHA-256, ES256)
      name: 'ECDSA',
      namedCurve: 'P-256',
      hash: {name: 'SHA-256'},
    },
    exportable,
    ['verify'],
  );

  try {
    const result = await crypto.subtle.verify(
      {name: 'ECDSA', hash: {name: 'SHA-256'}},
      publicKey,
      urlBase64ToUint8(signatureStr),
      strToUint8(headersStr + '.' + payloadStr),
    );

    if (result !== true) {
      return {
        verified: false,
        reason: "The JSON Web Token's signature does not match",
      };
    }

    const headers = tryParse(urlBase64ToString(tokenParts[0]));
    const payload = tryParse(urlBase64ToString(tokenParts[1]));
    if (
      typeof headers !== 'object' ||
      Array.isArray(headers) ||
      !headers ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      !payload
    ) {
      return {
        verified: false,
        reason: "The JSON Web Token's header and payload were not objects",
      };
    }

    const claimsValidationResult = validatePayload(payload);
    if (!claimsValidationResult.valid) {
      return {
        verified: false,
        reason: claimsValidationResult.reason,
      };
    }
    const claims = claimsValidationResult.value;

    const {iss, sub, aud, exp, nbf, iat, jti} = claims;

    // we allow 1 second of leeway in all timestamps
    if (exp !== undefined && (exp + 1) * 1000 < Date.now()) {
      return {
        verified: false,
        reason: 'This JSON Web Token has expired.',
      };
    }
    if (nbf !== undefined && (nbf - 1) * 1000 > Date.now()) {
      return {
        verified: false,
        reason: 'This JSON Web Token is not yet valid.',
      };
    }
    if (iat !== undefined && (iat - 60) * 1000 > Date.now()) {
      return {
        verified: false,
        reason:
          'This JSON Web Token appears to have been issued in the future.',
      };
    }

    const [issValid, subValid, audValid, jtiValid] = await Promise.all([
      isInAllowList(iss, allowLists.iss),
      isInAllowList(sub, allowLists.sub),
      isInAllowList(aud, allowLists.aud),
      isInAllowList(jti, allowLists.jti),
    ]);

    if (!issValid) {
      return {
        verified: false,
        reason: 'This JSON Web Token does not have a valid "iss" field.',
      };
    }

    if (!subValid) {
      return {
        verified: false,
        reason: 'This JSON Web Token does not have a valid "sub" field.',
      };
    }

    if (!audValid) {
      return {
        verified: false,
        reason: 'This JSON Web Token does not have a valid "aud" field.',
      };
    }

    if (!jtiValid) {
      return {
        verified: false,
        reason: 'This JSON Web Token does not have a valid "jti" field.',
      };
    }

    return {
      verified: true,
      headers,
      payload: claims,
    };
  } catch (ex) {
    return {
      verified: false,
      reason: "This web token's encoding does not seem to be valid.",
    };
  }
}

function tryParse(value: string): undefined | JsonValue {
  try {
    return JSON.parse(value);
  } catch (ex) {
    return undefined;
  }
}

export type AllowList =
  | string
  | string[]
  | Set<string>
  | ((value: string) => boolean | PromiseLike<boolean>);
async function isInAllowList(value: string | undefined, list?: AllowList) {
  if (list === undefined) {
    return true;
  }
  if (value === undefined) {
    return false;
  }
  if (typeof list === 'string') {
    return value === list;
  }
  if (Array.isArray(list)) {
    return list.includes(value);
  }
  if (list instanceof Set) {
    return list.has(value);
  }
  return await list(value);
}
