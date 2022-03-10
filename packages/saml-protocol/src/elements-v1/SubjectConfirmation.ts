// See 2.4.1.1 https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf

import {AuthMethod} from '../constants';
import {NameId, nameIdXml} from './NameId';

export interface SubjectConfirmation {
  /**
   * Identifies a protocol or mechanism to be used to confirm the subject.
   */
  method: AuthMethod;
  // TODO: <BaseID>
  // TODO: <EncryptedID>
  /**
   * Identifies the entity expected to satisfy the enclosing subject confirmation requirements.
   */
  id?: NameId;

  notBefore?: Date;
  notOnOrAfter?: Date;
  recipient?: URL;
  inResponseTo?: string;
  address?: string;
}

/**
 * Get the XMLBuilder parameters for the SubjectConfirmation element
 */
export function subjectConfirmationXml({
  method,
  id,
  notBefore,
  notOnOrAfter,
  recipient,
  inResponseTo,
  address,
}: SubjectConfirmation) {
  return {
    '@Method': method,
    NameID: id ? nameIdXml(id) : undefined,
    SubjectConfirmationData:
      notBefore || notOnOrAfter || recipient || inResponseTo || address
        ? {
            '@NotBefore': notBefore?.toISOString(),
            '@NotOnOrAfter': notOnOrAfter?.toISOString(),
            '@Recipient': recipient?.href,
            '@InResponseTo': inResponseTo,
            '@Address': address,
          }
        : undefined,
  };
}
