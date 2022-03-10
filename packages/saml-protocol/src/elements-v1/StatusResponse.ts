import {ConsentIdentifier, XMLNS} from '../constants';
import {NameId, nameIdXml} from './NameId';
import {Status, statusXml} from './Status';

/**
 * All SAML responses are of types that are derived from the StatusResponseType complex type.
 */
export interface StatusResponse {
  id: string;
  issueInstant: Date;
  /**
   * If the response is not generated in response to a request, or if the ID attribute value of a
   * request cannot be determined (for example, the request is malformed), then this attribute
   * MUST NOT be present. Otherwise, it MUST be present and its value MUST match the value of the
   * corresponding request's ID attribute
   */
  inResponseTo?: string;
  /**
   * A URI reference indicating the address to which this response has been sent. This is useful to prevent
   * malicious forwarding of responses to unintended recipients, a protection that is required by some
   * protocol bindings.
   */
  destination?: URL;
  consent?: ConsentIdentifier;
  issuer?: NameId;
  status: Status;
  // TODO: <ds:Signature>
  // TODO: <Extensions>
}

/**
 * Get the XMLBuilder parameters for the StatusResponseType element
 */
export function statusResponseXml({
  id,
  issueInstant,
  inResponseTo,
  destination,
  consent,
  issuer,
  status,
}: StatusResponse) {
  return {
    '@xmlns': XMLNS.SAMLP,
    '@xmlns:saml': XMLNS.SAML,
    '@ID': id,
    '@InResponseTo': inResponseTo,
    '@Version': '2.0',
    '@IssueInstant': issueInstant.toISOString(),
    '@Destination': destination?.href,
    '@Consent': consent,
    'saml:Issuer': issuer ? nameIdXml(issuer) : undefined,
    Status: statusXml(status),
  };
}
