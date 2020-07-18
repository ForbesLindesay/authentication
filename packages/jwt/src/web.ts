import {strToUrlBase64, strToUint8, uint8ToUrlBase64} from './web-utils';

export interface JsonWebKeyPrivate {
  kty: 'EC'; // we only support EC keys
  crv: string; // e.g. P-256
  x: string;
  y: string;
  d: string;

  ext: true;
  key_ops: ['sign'];
}

export interface JsonWebKeyPublic {
  kty: 'EC'; // we only support EC keys
  crv: string; // e.g. P-256
  x: string;
  y: string;
  key_ops: ['verify'];
}

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
  return (await crypto.subtle.exportKey(
    'jwk',
    key.privateKey,
  )) as JsonWebKeyPrivate;
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
    .then(function(hash) {
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
    key_ops: ['verify'],
  };
}

export async function jwtSign(
  jwk: JsonWebKeyPrivate,
  headers: any,
  payload: any,
): Promise<string> {
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
): Promise<boolean> {
  const tokenParts = jwt.split('.');

  if (tokenParts.length !== 3) {
    throw new Error('token must have 3 parts');
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

  const result = await crypto.subtle.verify(
    {name: 'ECDSA', hash: {name: 'SHA-256'}},
    publicKey,
    strToUint8(headersStr + '.' + payloadStr),
    strToUint8(signatureStr),
  );

  return result;
}

// addEventListener('fetch', event => {
//   event.respondWith(handleRequest(event.request));
// });

// /**
//  * Respond to the request
//  * @param {Request} request
//  */
// async function handleRequest(request) {
//   const clientIP = request.headers.get('CF-Connecting-IP');
//   console.log(clientIP);
//   var claims = {
//     iss: 'https://example.com/',
//     sub: 'xxx',
//     azp: 'https://cool.io/',
//     aud: 'https://example.com/',
//     exp: Math.round(Date.now() / 1000) + 15 * 60,
//   };
//   console.log(clientIP);

//   const jwk = await EC.generate();
//   console.log(jwk);
//   console.info('Private Key:', JSON.stringify(jwk));
//   console.info('Public Key:', JSON.stringify(EC.neuter(jwk)));

//   const kid = await JWK.thumbprint(jwk);
//   const jwt = await JWT.sign(jwk, {kid: kid}, claims);
//   return new Response(clientIP, {status: 200});
// }
