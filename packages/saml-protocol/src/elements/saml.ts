import * as t from 'funtypes';
import * as s from '../utils/schema';

export interface BaseIDAttributes {
  NameQualifier?: string;
  SPNameQualifier?: string;
}
export type BaseID = s.Element<'saml:BaseID', BaseIDAttributes, undefined>;
export function parseBaseID(
  element: any,
): {success: false; reason: string} | {success: true; value: BaseID} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['NameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['NameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NameQualifier'] = attributeResult.value;
  }
  if (element.attributes?.['SPNameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SPNameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SPNameQualifier'] = attributeResult.value;
  }
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface NameIDAttributes {
  NameQualifier?: string;
  SPNameQualifier?: string;
  Format?: s.anyURI;
  SPProvidedID?: string;
}
export type NameID = s.Element<'saml:NameID', NameIDAttributes, s.textNode>;
export function parseNameID(
  element: any,
): {success: false; reason: string} | {success: true; value: NameID} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['NameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['NameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NameQualifier'] = attributeResult.value;
  }
  if (element.attributes?.['SPNameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SPNameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SPNameQualifier'] = attributeResult.value;
  }
  if (element.attributes?.['Format'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Format']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Format'] = attributeResult.value;
  }
  if (element.attributes?.['SPProvidedID'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SPProvidedID']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SPProvidedID'] = attributeResult.value;
  }
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptedIDAttributes {}
export type EncryptedID = s.Element<
  'saml:EncryptedID',
  EncryptedIDAttributes,
  xenc_EncryptedData | xenc_EncryptedKey
>;
export function parseEncryptedID(
  element: any,
): {success: false; reason: string} | {success: true; value: EncryptedID} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parsexenc_EncryptedData,
    parsexenc_EncryptedKey,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface IssuerAttributes {
  NameQualifier?: string;
  SPNameQualifier?: string;
  Format?: s.anyURI;
  SPProvidedID?: string;
}
export type Issuer = s.Element<'saml:Issuer', IssuerAttributes, s.textNode>;
export function parseIssuer(
  element: any,
): {success: false; reason: string} | {success: true; value: Issuer} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['NameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['NameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NameQualifier'] = attributeResult.value;
  }
  if (element.attributes?.['SPNameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SPNameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SPNameQualifier'] = attributeResult.value;
  }
  if (element.attributes?.['Format'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Format']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Format'] = attributeResult.value;
  }
  if (element.attributes?.['SPProvidedID'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SPProvidedID']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SPProvidedID'] = attributeResult.value;
  }
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AssertionIDRefAttributes {}
export type AssertionIDRef = s.Element<
  'saml:AssertionIDRef',
  AssertionIDRefAttributes,
  s.NCName
>;
export function parseAssertionIDRef(
  element: any,
): {success: false; reason: string} | {success: true; value: AssertionIDRef} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.NCNameSchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AssertionURIRefAttributes {}
export type AssertionURIRef = s.Element<
  'saml:AssertionURIRef',
  AssertionURIRefAttributes,
  s.anyURI
>;
export function parseAssertionURIRef(
  element: any,
): {success: false; reason: string} | {success: true; value: AssertionURIRef} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.anyURISchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SubjectConfirmationDataAttributes {
  NotBefore?: s.dateTime;
  NotOnOrAfter?: s.dateTime;
  Recipient?: s.anyURI;
  InResponseTo?: s.NCName;
  Address?: string;
}
export type SubjectConfirmationData = s.Element<
  'saml:SubjectConfirmationData',
  SubjectConfirmationDataAttributes,
  unknown
>;
export function parseSubjectConfirmationData(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: SubjectConfirmationData} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['NotBefore'] !== undefined) {
    attributeResult = s.dateTimeSchema.safeParse(
      element.attributes['NotBefore'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NotBefore'] = attributeResult.value;
  }
  if (element.attributes?.['NotOnOrAfter'] !== undefined) {
    attributeResult = s.dateTimeSchema.safeParse(
      element.attributes['NotOnOrAfter'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NotOnOrAfter'] = attributeResult.value;
  }
  if (element.attributes?.['Recipient'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Recipient']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Recipient'] = attributeResult.value;
  }
  if (element.attributes?.['InResponseTo'] !== undefined) {
    attributeResult = s.NCNameSchema.safeParse(
      element.attributes['InResponseTo'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['InResponseTo'] = attributeResult.value;
  }
  if (element.attributes?.['Address'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['Address']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Address'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SubjectConfirmationAttributes {
  Method: s.anyURI;
}
export type SubjectConfirmation = s.Element<
  'saml:SubjectConfirmation',
  SubjectConfirmationAttributes,
  BaseID | NameID | EncryptedID | SubjectConfirmationData
>;
export function parseSubjectConfirmation(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: SubjectConfirmation} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Method']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Method'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    s.choiceParser(parseBaseID, parseNameID, parseEncryptedID),
    parseSubjectConfirmationData,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SubjectAttributes {}
export type Subject = s.Element<
  'saml:Subject',
  SubjectAttributes,
  BaseID | NameID | EncryptedID | SubjectConfirmation | SubjectConfirmation
>;
export function parseSubject(
  element: any,
): {success: false; reason: string} | {success: true; value: Subject} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    s.sequenceParser(
      s.choiceParser(parseBaseID, parseNameID, parseEncryptedID),
      parseSubjectConfirmation,
    ),
    parseSubjectConfirmation,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ConditionAttributes {}
export type Condition = s.Element<
  'saml:Condition',
  ConditionAttributes,
  undefined
>;
export function parseCondition(
  element: any,
): {success: false; reason: string} | {success: true; value: Condition} {
  const attributes: any = {};
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface AudienceAttributes {}
export type Audience = s.Element<'saml:Audience', AudienceAttributes, s.anyURI>;
export function parseAudience(
  element: any,
): {success: false; reason: string} | {success: true; value: Audience} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.anyURISchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AudienceRestrictionAttributes {}
export type AudienceRestriction = s.Element<
  'saml:AudienceRestriction',
  AudienceRestrictionAttributes,
  Audience
>;
export function parseAudienceRestriction(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AudienceRestriction} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(parseAudience)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface OneTimeUseAttributes {}
export type OneTimeUse = s.Element<
  'saml:OneTimeUse',
  OneTimeUseAttributes,
  undefined
>;
export function parseOneTimeUse(
  element: any,
): {success: false; reason: string} | {success: true; value: OneTimeUse} {
  const attributes: any = {};
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface ProxyRestrictionAttributes {
  Count?: s.nonNegativeInteger;
}
export type ProxyRestriction = s.Element<
  'saml:ProxyRestriction',
  ProxyRestrictionAttributes,
  Audience
>;
export function parseProxyRestriction(
  element: any,
): {success: false; reason: string} | {success: true; value: ProxyRestriction} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Count'] !== undefined) {
    attributeResult = s.nonNegativeIntegerSchema.safeParse(
      element.attributes['Count'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Count'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseAudience)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ConditionsAttributes {
  NotBefore?: s.dateTime;
  NotOnOrAfter?: s.dateTime;
}
export type Conditions = s.Element<
  'saml:Conditions',
  ConditionsAttributes,
  Condition | AudienceRestriction | OneTimeUse | ProxyRestriction
>;
export function parseConditions(
  element: any,
): {success: false; reason: string} | {success: true; value: Conditions} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['NotBefore'] !== undefined) {
    attributeResult = s.dateTimeSchema.safeParse(
      element.attributes['NotBefore'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NotBefore'] = attributeResult.value;
  }
  if (element.attributes?.['NotOnOrAfter'] !== undefined) {
    attributeResult = s.dateTimeSchema.safeParse(
      element.attributes['NotOnOrAfter'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NotOnOrAfter'] = attributeResult.value;
  }
  const childrenResult = s.choiceParser(
    parseCondition,
    parseAudienceRestriction,
    parseOneTimeUse,
    parseProxyRestriction,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptedAssertionAttributes {}
export type EncryptedAssertion = s.Element<
  'saml:EncryptedAssertion',
  EncryptedAssertionAttributes,
  xenc_EncryptedData | xenc_EncryptedKey
>;
export function parseEncryptedAssertion(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: EncryptedAssertion} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parsexenc_EncryptedData,
    parsexenc_EncryptedKey,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AdviceAttributes {}
export type Advice = s.Element<
  'saml:Advice',
  AdviceAttributes,
  AssertionIDRef | AssertionURIRef | Assertion | EncryptedAssertion | unknown
>;
export function parseAdvice(
  element: any,
): {success: false; reason: string} | {success: true; value: Advice} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    parseAssertionIDRef,
    parseAssertionURIRef,
    parseAssertion,
    parseEncryptedAssertion,
    parseUnknown,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface StatementAttributes {}
export type Statement = s.Element<
  'saml:Statement',
  StatementAttributes,
  undefined
>;
export function parseStatement(
  element: any,
): {success: false; reason: string} | {success: true; value: Statement} {
  const attributes: any = {};
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface SubjectLocalityAttributes {
  Address?: string;
  DNSName?: string;
}
export type SubjectLocality = s.Element<
  'saml:SubjectLocality',
  SubjectLocalityAttributes,
  undefined
>;
export function parseSubjectLocality(
  element: any,
): {success: false; reason: string} | {success: true; value: SubjectLocality} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Address'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['Address']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Address'] = attributeResult.value;
  }
  if (element.attributes?.['DNSName'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['DNSName']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['DNSName'] = attributeResult.value;
  }
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface AuthnContextClassRefAttributes {}
export type AuthnContextClassRef = s.Element<
  'saml:AuthnContextClassRef',
  AuthnContextClassRefAttributes,
  s.anyURI
>;
export function parseAuthnContextClassRef(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AuthnContextClassRef} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.anyURISchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthnContextDeclAttributes {}
export type AuthnContextDecl = s.Element<
  'saml:AuthnContextDecl',
  AuthnContextDeclAttributes,
  unknown
>;
export function parseAuthnContextDecl(
  element: any,
): {success: false; reason: string} | {success: true; value: AuthnContextDecl} {
  const attributes: any = {};
  const childrenResult = t.Unknown.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthnContextDeclRefAttributes {}
export type AuthnContextDeclRef = s.Element<
  'saml:AuthnContextDeclRef',
  AuthnContextDeclRefAttributes,
  s.anyURI
>;
export function parseAuthnContextDeclRef(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AuthnContextDeclRef} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.anyURISchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthenticatingAuthorityAttributes {}
export type AuthenticatingAuthority = s.Element<
  'saml:AuthenticatingAuthority',
  AuthenticatingAuthorityAttributes,
  s.anyURI
>;
export function parseAuthenticatingAuthority(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AuthenticatingAuthority} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.anyURISchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthnContextAttributes {}
export type AuthnContext = s.Element<
  'saml:AuthnContext',
  AuthnContextAttributes,
  | AuthnContextClassRef
  | AuthnContextDecl
  | AuthnContextDeclRef
  | AuthnContextDecl
  | AuthnContextDeclRef
  | AuthenticatingAuthority
>;
export function parseAuthnContext(
  element: any,
): {success: false; reason: string} | {success: true; value: AuthnContext} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    s.choiceParser(
      s.sequenceParser(
        parseAuthnContextClassRef,
        s.choiceParser(parseAuthnContextDecl, parseAuthnContextDeclRef),
      ),
      s.choiceParser(parseAuthnContextDecl, parseAuthnContextDeclRef),
    ),
    parseAuthenticatingAuthority,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthnStatementAttributes {
  AuthnInstant: s.dateTime;
  SessionIndex?: string;
  SessionNotOnOrAfter?: s.dateTime;
}
export type AuthnStatement = s.Element<
  'saml:AuthnStatement',
  AuthnStatementAttributes,
  SubjectLocality | AuthnContext
>;
export function parseAuthnStatement(
  element: any,
): {success: false; reason: string} | {success: true; value: AuthnStatement} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['AuthnInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['AuthnInstant'] = attributeResult.value;
  if (element.attributes?.['SessionIndex'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SessionIndex']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SessionIndex'] = attributeResult.value;
  }
  if (element.attributes?.['SessionNotOnOrAfter'] !== undefined) {
    attributeResult = s.dateTimeSchema.safeParse(
      element.attributes['SessionNotOnOrAfter'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SessionNotOnOrAfter'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parseSubjectLocality,
    parseAuthnContext,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ActionAttributes {
  Namespace: s.anyURI;
}
export type Action = s.Element<'saml:Action', ActionAttributes, s.textNode>;
export function parseAction(
  element: any,
): {success: false; reason: string} | {success: true; value: Action} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Namespace']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Namespace'] = attributeResult.value;
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EvidenceAttributes {}
export type Evidence = s.Element<
  'saml:Evidence',
  EvidenceAttributes,
  AssertionIDRef | AssertionURIRef | Assertion | EncryptedAssertion
>;
export function parseEvidence(
  element: any,
): {success: false; reason: string} | {success: true; value: Evidence} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    parseAssertionIDRef,
    parseAssertionURIRef,
    parseAssertion,
    parseEncryptedAssertion,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthzDecisionStatementAttributes {
  Resource: s.anyURI;
  Decision: DecisionType;
}
export type AuthzDecisionStatement = s.Element<
  'saml:AuthzDecisionStatement',
  AuthzDecisionStatementAttributes,
  Action | Evidence
>;
export function parseAuthzDecisionStatement(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AuthzDecisionStatement} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Resource']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Resource'] = attributeResult.value;
  attributeResult = DecisionTypeSchema.safeParse(
    element.attributes['Decision'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Decision'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    parseAction,
    parseEvidence,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AttributeValueAttributes {}
export type AttributeValue = s.Element<
  'saml:AttributeValue',
  AttributeValueAttributes,
  unknown
>;
export function parseAttributeValue(
  element: any,
): {success: false; reason: string} | {success: true; value: AttributeValue} {
  const attributes: any = {};
  const childrenResult = t.Unknown.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AttributeAttributes {
  Name: string;
  NameFormat?: s.anyURI;
  FriendlyName?: string;
}
export type Attribute = s.Element<
  'saml:Attribute',
  AttributeAttributes,
  AttributeValue
>;
export function parseAttribute(
  element: any,
): {success: false; reason: string} | {success: true; value: Attribute} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = t.String.safeParse(element.attributes['Name']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Name'] = attributeResult.value;
  if (element.attributes?.['NameFormat'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['NameFormat'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NameFormat'] = attributeResult.value;
  }
  if (element.attributes?.['FriendlyName'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['FriendlyName']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['FriendlyName'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseAttributeValue)(
    element.elements,
  );
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptedAttributeAttributes {}
export type EncryptedAttribute = s.Element<
  'saml:EncryptedAttribute',
  EncryptedAttributeAttributes,
  xenc_EncryptedData | xenc_EncryptedKey
>;
export function parseEncryptedAttribute(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: EncryptedAttribute} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parsexenc_EncryptedData,
    parsexenc_EncryptedKey,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AttributeStatementAttributes {}
export type AttributeStatement = s.Element<
  'saml:AttributeStatement',
  AttributeStatementAttributes,
  Attribute | EncryptedAttribute
>;
export function parseAttributeStatement(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AttributeStatement} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    parseAttribute,
    parseEncryptedAttribute,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AssertionAttributes {
  Version: string;
  ID: s.ID;
  IssueInstant: s.dateTime;
}
export type Assertion = s.Element<
  'saml:Assertion',
  AssertionAttributes,
  | Issuer
  | ds_Signature
  | Subject
  | Conditions
  | Advice
  | Statement
  | AuthnStatement
  | AuthzDecisionStatement
  | AttributeStatement
>;
export function parseAssertion(
  element: any,
): {success: false; reason: string} | {success: true; value: Assertion} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    parseIssuer,
    parseds_Signature,
    parseSubject,
    parseConditions,
    parseAdvice,
    s.choiceParser(
      parseStatement,
      parseAuthnStatement,
      parseAuthzDecisionStatement,
      parseAttributeStatement,
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
