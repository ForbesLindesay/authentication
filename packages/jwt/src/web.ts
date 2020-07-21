// Uses the crypto.subtle API - available in browsers, web workers, service works & cloudflare workers

import {
  JsonObject,
  isValidPrivateKey,
  JsonWebKeyPrivate,
  isValidPublicKey,
  JsonWebKeyPublic,
  JsonWebKeyCurve,
  jwtValidate,
  AllowList,
  JsonWebTokenPayload,
  validatePayload,
  getPublicKey,
} from './shared';
import {
  strToUrlBase64,
  strToUint8,
  uint8ToUrlBase64,
  urlBase64ToUint8,
  urlBase64ToString,
} from './web-utils';

export {
  JsonWebKeyCurve,
  isValidPrivateKey,
  JsonWebKeyPrivate,
  isValidPublicKey,
  JsonWebKeyPublic,
};

/**
 * Generate a private JsonWebKey. This key should be stored
 * on whichever device needs to be able to sign JWTs.
 *
 * N.B. DO NOT SHARE THIS KEY!
 */
export async function generatePrivateKey({
  namedCurve = 'P-256',
}: {namedCurve?: JsonWebKeyCurve} = {}): Promise<JsonWebKeyPrivate> {
  const exportable = true;
  const key = await crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve,
    },
    exportable,
    ['sign'],
  );
  const k = await crypto.subtle.exportKey('jwk', key.privateKey);
  if (k.kty !== 'EC') {
    throw new Error('Expected k.kty to be EC');
  }
  const result = {
    kty: 'EC',
    crv: k.crv,
    d: k.d,
    x: k.x,
    y: k.y,
  };
  if (!isValidPrivateKey(result)) {
    throw new Error('Generated invalid private key');
  }
  return result;
}

export {getPublicKey};

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
  allowLists?: {
    iss?: AllowList;
    sub?: AllowList;
    aud?: AllowList;
    jti?: AllowList;
  },
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

    return jwtValidate(
      urlBase64ToString(tokenParts[0]),
      urlBase64ToString(tokenParts[1]),
    );
  } catch (ex) {
    return {
      verified: false,
      reason: "This web token's encoding does not seem to be valid.",
    };
  }
}
