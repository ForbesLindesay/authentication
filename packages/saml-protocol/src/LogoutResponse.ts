import * as XmlBuilder from 'xmlbuilder2';
import {XMLNS} from './constants';
import getRequestId from './getRequestId';

export interface LogoutResponseOptions {
  issuer: string;
  in_response_to: string;
  destination: string;
  status: string;
}

/**
 * Creates a LogoutResponse and returns it as a string of xml.
 */
export function createLogoutResponse({
  issuer,
  in_response_to,
  destination,
  status,
}: LogoutResponseOptions) {
  const id = getRequestId();
  const xml = XmlBuilder.create({
    'samlp:LogoutResponse': {
      '@Destination': destination,
      '@ID': getRequestId(),
      '@InResponseTo': in_response_to,
      '@IssueInstant': new Date().toISOString(),
      '@Version': '2.0',
      '@xmlns:samlp': XMLNS.SAMLP,
      '@xmlns:saml': XMLNS.SAML,
      'saml:Issuer': issuer,
      'samlp:Status': {
        'samlp:StatusCode': {'@Value': status},
      },
    },
  }).end();

  return {id, xml};
}
