import * as XmlBuilder from 'xmlbuilder2';

import {SEARCH_PARAMS, SIGNATURE_ALGORITHM} from '../constants';
import {deflateRaw} from '../Compression';
import {createSign} from 'crypto';
import {formatPem} from '../Certificate';
import {AuthnRequest, authnRequestXml} from '../elements-v1/AuthnRequest';

/**
 * Creates an AuthnRequest and returns it as a string of xml
 */
export function createAuthnRequest(authnRequest: AuthnRequest) {
  const xml = XmlBuilder.create({
    AuthnRequest: authnRequestXml(authnRequest),
  }).end();
  return xml;
}

export interface LoginRequestOptions extends AuthnRequest {
  idpLoginUrl: URL;
  relayState?: string;
  signRequest?: {
    algorithm: keyof typeof SIGNATURE_ALGORITHM;
    privateKey: string;
  };
}

/**
 * Returns a redirect URL at which a user can login,
 * and the ID of the request
 */
export async function createLoginRequestUrl({
  idpLoginUrl,
  relayState,
  signRequest,
  ...options
}: LoginRequestOptions): Promise<URL> {
  const xml = createAuthnRequest(options);
  const deflated = await deflateRaw(xml);
  const url = new URL(idpLoginUrl.href.split(`?`)[0]);
  url.searchParams.append(
    SEARCH_PARAMS.SAMLRequest,
    deflated.toString(`base64`),
  );
  if (relayState) {
    url.searchParams.append(SEARCH_PARAMS.RelayState, relayState);
  }
  if (signRequest) {
    url.searchParams.append(
      SEARCH_PARAMS.SigAlg,
      SIGNATURE_ALGORITHM[signRequest.algorithm],
    );
    const sign = createSign(signRequest.algorithm.toUpperCase());
    sign.update(url.search.substring(`?`.length));
    url.searchParams.append(
      SEARCH_PARAMS.Signature,
      sign.sign(formatPem(signRequest.privateKey, 'PRIVATE_KEY'), 'base64'),
    );
  }
  return url;
}
