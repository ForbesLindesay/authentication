import {Attribute, attributeXml} from './Attribute';
import {Conditions} from './Conditions';
import {NameId, nameIdXml} from './NameId';
import {Subject, SubjectXml} from './Subject';

// See 2.3.3 https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf

/**
 * An assertion with no statements MUST contain a <Subject> element. Such an assertion identifies a
 * principal in a manner which can be referenced or confirmed using SAML methods, but asserts no further
 * information associated with that principal.
 *
 * Otherwise <Subject>, if present, identifies the subject of all of the statements in the assertion. If
 * <Subject> is omitted, then the statements in the assertion apply to a subject or subjects identified in an
 * application- or profile-specific manner. SAML itself defines no such statements, and an assertion without a
 * subject has no defined meaning in this specification.
 */
export interface Assertion {
  id: string;
  issuer: NameId;
  subject?: Subject;
  /**
   * Conditions that MUST be evaluated when assessing the validity of and/or when using the assertion.
   */
  conditions?: Conditions;

  // TODO: EncryptedAttribute
  attributes: Attribute[];
  // advice?: Advice;

  // statements?: (AuthnStatement | AuthzDecisionStatement | AttributeStatement)[];
  // TODO: <Advice>
  // TODO <AuthnStatement>
  // TODO <AuthzDecisionStatement>
  // TODO <ds:Signature>
}

/**
 * Get the XMLBuilder parameters for the Assertion element
 */
export function assertionXml({
  id,
  issuer,
  subject,
  conditions,
  attributes,
}: Assertion) {
  return {
    '@ID': id,
    '@Version': '2.0',
    '@IssueInstant': new Date().toISOString(),
    Issuer: nameIdXml(issuer),
    Subject: subject ? SubjectXml(subject) : undefined,
    Conditions: conditions,
    AttributeStatement: attributes.length
      ? {Attribute: attributes.map((a) => attributeXml(a))}
      : undefined,
  };
}
