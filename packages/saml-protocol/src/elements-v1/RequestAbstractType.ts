import {ConsentIdentifier, XMLNS} from '../constants';
import {NameId, nameIdXml} from './NameId';

export interface RequestAbstractType {
  id: string;
  issueInstant: Date;
  destination: URL;
  consent?: ConsentIdentifier;
  issuer?: NameId;
  // TODO: <ds:Signature>
  // TODO: <Extensions>
}

/**
 * Get the XMLBuilder parameters for the RequestAbstractType element
 */
export function requestAbstractTypeXml({
  id,
  issueInstant,
  destination,
  consent,
  issuer,
}: RequestAbstractType) {
  return {
    '@xmlns': XMLNS.SAMLP,
    '@xmlns:saml': XMLNS.SAML,
    '@ID': id,
    '@Version': '2.0',
    '@IssueInstant': issueInstant.toISOString(),
    '@Destination': destination.href,
    '@Consent': consent,
    'saml:Issuer': issuer ? nameIdXml(issuer) : undefined,
  };
}
