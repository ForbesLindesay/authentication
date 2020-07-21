// mostly based on https://github.com/calvinmetcalf/native-crypto/blob/bfba0b795abd3a7da69ecd15382633f29db334a9/lib/ecdh.js

import {createECDH} from 'crypto';
import {
  JsonWebKeyCurve,
  JsonWebKeyPrivate,
  JsonObject,
  validatePayload,
  JsonWebTokenPayload,
} from './shared';

function base64UrlEncode(buf: Buffer) {
  return buf
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+/g, '');
}
function base64UrlDecode(str: string) {
  return Buffer.from(str.replace(/\-/g, '+').replace(/_/g, '/'), 'base64');
}

function jsonWebKeyCurveToNode(crv: JsonWebKeyCurve): string {
  switch (crv) {
    case 'P-256':
      return 'prime256v1';
    case 'P-384':
      return 'secp384r1';
    case 'P-521':
      return 'secp521r1';
  }
}
function jsonWebKeyCurveByteLength(crv: JsonWebKeyCurve): number {
  switch (crv) {
    case 'P-256':
      return 32;
    case 'P-384':
      return 48;
    case 'P-521':
      return 66;
  }
}

export async function generatePrivateKey({
  namedCurve = 'P-256',
}: {namedCurve?: JsonWebKeyCurve} = {}): Promise<JsonWebKeyPrivate> {
  const pair = createECDH(jsonWebKeyCurveToNode(namedCurve));
  const publicKey = pair.getPublicKey();
  return {
    kty: 'EC',
    crv: namedCurve,
    x: base64UrlEncode(
      publicKey.slice(0, jsonWebKeyCurveByteLength(namedCurve)),
    ),
    y: base64UrlEncode(publicKey.slice(jsonWebKeyCurveByteLength(namedCurve))),
    d: base64UrlEncode(pair.getPrivateKey()),
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
  const headersStr = base64UrlEncode(
    Buffer.from(
      JSON.stringify({
        ...headers,
        typ: 'JWT',
        alg: 'ES256',
      }),
    ),
  );
  const payloadStr = base64UrlEncode(Buffer.from(JSON.stringify(payload)));

  const privateKey = await base64UrlDecode(jwk.d);

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

// function generateECC(type) {
//   const pair = createECDH(jsonWebKeyCurveToNode(type));
//   pair.generateKeys();
//   var publicKey = jwk.toJwk(pair.getPublicKey(), type);

//   return {
//     publicKey,
//     privateKey,
//   };
// }
