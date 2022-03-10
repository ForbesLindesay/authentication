import {NameId, nameIdXml} from './NameId';
import {
  SubjectConfirmation,
  subjectConfirmationXml,
} from './SubjectConfirmation';

// See 2.4.1 https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf

/**
 * The optional <Subject> element specifies the principal that is the subject of all of the (zero or more)
 * statements in the assertion.
 */
export interface Subject {
  // TODO: <BaseID>
  // TODO: <EncryptedID>
  id?: NameId;
  confirmations?: SubjectConfirmation[];
}

/**
 * Get the XMLBuilder parameters for the Subject element
 */
export function SubjectXml({id, confirmations}: Subject) {
  return {
    NameID: id ? nameIdXml(id) : undefined,
    SubjectConfirmation: confirmations?.map(subjectConfirmationXml),
  };
}
