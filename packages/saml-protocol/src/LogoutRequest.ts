import * as XmlBuilder from 'xmlbuilder2';
import {XMLNS} from './constants';
import getRequestId from './getRequestId';

export interface LogoutRequestOptions {
  issuer: string;
  name_id: string;
  session_index: string;
  destination: string;
}

/**
 * Creates a LogoutRequest and returns it as a string of xml.
 */
export function createLogoutRequest({
  issuer,
  name_id,
  session_index,
  destination,
}: LogoutRequestOptions) {
  const id = getRequestId();
  const xml = XmlBuilder.create({
    'samlp:LogoutRequest': {
      '@xmlns:samlp': XMLNS.SAMLP,
      '@xmlns:saml': XMLNS.SAML,
      '@ID': id,
      '@Version': '2.0',
      '@IssueInstant': new Date().toISOString(),
      '@Destination': destination,
      'saml:Issuer': issuer,
      'saml:NameID': name_id,
      'samlp:SessionIndex': session_index,
    },
  }).end();

  return {id, xml};
}
