import * as t from 'funtypes';
import * as s from '../utils/schema';

export interface ExtensionsAttributes {}
export type Extensions = s.Element<
  'samlp:Extensions',
  ExtensionsAttributes,
  unknown
>;
export function parseExtensions(
  element: any,
): {success: false; reason: string} | {success: true; value: Extensions} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface StatusCodeAttributes {
  Value: s.anyURI;
}
export type StatusCode = s.Element<
  'samlp:StatusCode',
  StatusCodeAttributes,
  StatusCode
>;
export function parseStatusCode(
  element: any,
): {success: false; reason: string} | {success: true; value: StatusCode} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Value']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Value'] = attributeResult.value;
  const childrenResult = s.sequenceParser(parseStatusCode)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface StatusMessageAttributes {}
export type StatusMessage = s.Element<
  'samlp:StatusMessage',
  StatusMessageAttributes,
  s.textNode
>;
export function parseStatusMessage(
  element: any,
): {success: false; reason: string} | {success: true; value: StatusMessage} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface StatusDetailAttributes {}
export type StatusDetail = s.Element<
  'samlp:StatusDetail',
  StatusDetailAttributes,
  unknown
>;
export function parseStatusDetail(
  element: any,
): {success: false; reason: string} | {success: true; value: StatusDetail} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface StatusAttributes {}
export type Status = s.Element<
  'samlp:Status',
  StatusAttributes,
  StatusCode | StatusMessage | StatusDetail
>;
export function parseStatus(
  element: any,
): {success: false; reason: string} | {success: true; value: Status} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parseStatusCode,
    parseStatusMessage,
    parseStatusDetail,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AssertionIDRequestAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type AssertionIDRequest = s.Element<
  'samlp:AssertionIDRequest',
  AssertionIDRequestAttributes,
  saml_Issuer | ds_Signature | (Extensions & saml_AssertionIDRef)
>;
export function parseAssertionIDRequest(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AssertionIDRequest} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(serializesaml_AssertionIDRef),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SubjectQueryAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type SubjectQuery = s.Element<
  'samlp:SubjectQuery',
  SubjectQueryAttributes,
  saml_Issuer | ds_Signature | (Extensions & saml_Subject)
>;
export function parseSubjectQuery(
  element: any,
): {success: false; reason: string} | {success: true; value: SubjectQuery} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(serializesaml_Subject),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface RequestedAuthnContextAttributes {
  Comparison?: AuthnContextComparisonType;
}
export type RequestedAuthnContext = s.Element<
  'samlp:RequestedAuthnContext',
  RequestedAuthnContextAttributes,
  saml_AuthnContextClassRef | saml_AuthnContextDeclRef
>;
export function parseRequestedAuthnContext(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: RequestedAuthnContext} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Comparison'] !== undefined) {
    attributeResult = AuthnContextComparisonTypeSchema.safeParse(
      element.attributes['Comparison'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Comparison'] = attributeResult.value;
  }
  const childrenResult = s.choiceParser(
    parsesaml_AuthnContextClassRef,
    parsesaml_AuthnContextDeclRef,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthnQueryAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
  SessionIndex?: string;
}
export type AuthnQuery = s.Element<
  'samlp:AuthnQuery',
  AuthnQueryAttributes,
  | saml_Issuer
  | ds_Signature
  | (Extensions & saml_Subject & RequestedAuthnContext)
>;
export function parseAuthnQuery(
  element: any,
): {success: false; reason: string} | {success: true; value: AuthnQuery} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  if (element.attributes?.['SessionIndex'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SessionIndex']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SessionIndex'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
      s.sequenceParser(serializesaml_Subject),
    ),
    s.sequenceParser(serializeRequestedAuthnContext),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AttributeQueryAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type AttributeQuery = s.Element<
  'samlp:AttributeQuery',
  AttributeQueryAttributes,
  saml_Issuer | ds_Signature | (Extensions & saml_Subject & saml_Attribute)
>;
export function parseAttributeQuery(
  element: any,
): {success: false; reason: string} | {success: true; value: AttributeQuery} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
      s.sequenceParser(serializesaml_Subject),
    ),
    s.sequenceParser(serializesaml_Attribute),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthzDecisionQueryAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
  Resource: s.anyURI;
}
export type AuthzDecisionQuery = s.Element<
  'samlp:AuthzDecisionQuery',
  AuthzDecisionQueryAttributes,
  | saml_Issuer
  | ds_Signature
  | (Extensions & saml_Subject & saml_Action)
  | saml_Evidence
>;
export function parseAuthzDecisionQuery(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: AuthzDecisionQuery} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  attributeResult = s.anyURISchema.safeParse(element.attributes['Resource']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Resource'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
      s.sequenceParser(serializesaml_Subject),
    ),
    s.sequenceParser(serializesaml_Action, serializesaml_Evidence),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface NameIDPolicyAttributes {
  Format?: s.anyURI;
  SPNameQualifier?: string;
  AllowCreate?: s.boolean;
}
export type NameIDPolicy = s.Element<
  'samlp:NameIDPolicy',
  NameIDPolicyAttributes,
  undefined
>;
export function parseNameIDPolicy(
  element: any,
): {success: false; reason: string} | {success: true; value: NameIDPolicy} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Format'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Format']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Format'] = attributeResult.value;
  }
  if (element.attributes?.['SPNameQualifier'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['SPNameQualifier']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['SPNameQualifier'] = attributeResult.value;
  }
  if (element.attributes?.['AllowCreate'] !== undefined) {
    attributeResult = s.booleanSchema.safeParse(
      element.attributes['AllowCreate'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['AllowCreate'] = attributeResult.value;
  }
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface IDPEntryAttributes {
  ProviderID: s.anyURI;
  Name?: string;
  Loc?: s.anyURI;
}
export type IDPEntry = s.Element<
  'samlp:IDPEntry',
  IDPEntryAttributes,
  undefined
>;
export function parseIDPEntry(
  element: any,
): {success: false; reason: string} | {success: true; value: IDPEntry} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['ProviderID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ProviderID'] = attributeResult.value;
  if (element.attributes?.['Name'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['Name']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Name'] = attributeResult.value;
  }
  if (element.attributes?.['Loc'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Loc']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Loc'] = attributeResult.value;
  }
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface GetCompleteAttributes {}
export type GetComplete = s.Element<
  'samlp:GetComplete',
  GetCompleteAttributes,
  s.anyURI
>;
export function parseGetComplete(
  element: any,
): {success: false; reason: string} | {success: true; value: GetComplete} {
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
export interface IDPListAttributes {}
export type IDPList = s.Element<
  'samlp:IDPList',
  IDPListAttributes,
  IDPEntry | GetComplete
>;
export function parseIDPList(
  element: any,
): {success: false; reason: string} | {success: true; value: IDPList} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parseIDPEntry,
    parseGetComplete,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface RequesterIDAttributes {}
export type RequesterID = s.Element<
  'samlp:RequesterID',
  RequesterIDAttributes,
  s.anyURI
>;
export function parseRequesterID(
  element: any,
): {success: false; reason: string} | {success: true; value: RequesterID} {
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
export interface ScopingAttributes {
  ProxyCount?: s.nonNegativeInteger;
}
export type Scoping = s.Element<
  'samlp:Scoping',
  ScopingAttributes,
  IDPList | RequesterID
>;
export function parseScoping(
  element: any,
): {success: false; reason: string} | {success: true; value: Scoping} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['ProxyCount'] !== undefined) {
    attributeResult = s.nonNegativeIntegerSchema.safeParse(
      element.attributes['ProxyCount'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['ProxyCount'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parseIDPList,
    parseRequesterID,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AuthnRequestAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
  ForceAuthn?: s.boolean;
  IsPassive?: s.boolean;
  ProtocolBinding?: s.anyURI;
  AssertionConsumerServiceIndex?: s.unsignedShort;
  AssertionConsumerServiceURL?: s.anyURI;
  AttributeConsumingServiceIndex?: s.unsignedShort;
  ProviderName?: string;
}
export type AuthnRequest = s.Element<
  'samlp:AuthnRequest',
  AuthnRequestAttributes,
  | saml_Issuer
  | ds_Signature
  | (Extensions & saml_Subject)
  | NameIDPolicy
  | saml_Conditions
  | RequestedAuthnContext
  | Scoping
>;
export function parseAuthnRequest(
  element: any,
): {success: false; reason: string} | {success: true; value: AuthnRequest} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  if (element.attributes?.['ForceAuthn'] !== undefined) {
    attributeResult = s.booleanSchema.safeParse(
      element.attributes['ForceAuthn'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['ForceAuthn'] = attributeResult.value;
  }
  if (element.attributes?.['IsPassive'] !== undefined) {
    attributeResult = s.booleanSchema.safeParse(
      element.attributes['IsPassive'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['IsPassive'] = attributeResult.value;
  }
  if (element.attributes?.['ProtocolBinding'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['ProtocolBinding'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['ProtocolBinding'] = attributeResult.value;
  }
  if (element.attributes?.['AssertionConsumerServiceIndex'] !== undefined) {
    attributeResult = s.unsignedShortSchema.safeParse(
      element.attributes['AssertionConsumerServiceIndex'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['AssertionConsumerServiceIndex'] = attributeResult.value;
  }
  if (element.attributes?.['AssertionConsumerServiceURL'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['AssertionConsumerServiceURL'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['AssertionConsumerServiceURL'] = attributeResult.value;
  }
  if (element.attributes?.['AttributeConsumingServiceIndex'] !== undefined) {
    attributeResult = s.unsignedShortSchema.safeParse(
      element.attributes['AttributeConsumingServiceIndex'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['AttributeConsumingServiceIndex'] = attributeResult.value;
  }
  if (element.attributes?.['ProviderName'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['ProviderName']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['ProviderName'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(
      serializesaml_Subject,
      serializeNameIDPolicy,
      serializesaml_Conditions,
      serializeRequestedAuthnContext,
      serializeScoping,
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ResponseAttributes {
  ID: s.ID;
  InResponseTo?: s.NCName;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type Response = s.Element<
  'samlp:Response',
  ResponseAttributes,
  | saml_Issuer
  | ds_Signature
  | Extensions
  | (Status & saml_Assertion)
  | saml_EncryptedAssertion
>;
export function parseResponse(
  element: any,
): {success: false; reason: string} | {success: true; value: Response} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  if (element.attributes?.['InResponseTo'] !== undefined) {
    attributeResult = s.NCNameSchema.safeParse(
      element.attributes['InResponseTo'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['InResponseTo'] = attributeResult.value;
  }
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      parsesaml_Issuer,
      parseds_Signature,
      parseExtensions,
      parseStatus,
    ),
    s.choiceSerializer(
      serializesaml_Assertion,
      serializesaml_EncryptedAssertion,
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ArtifactAttributes {}
export type Artifact = s.Element<
  'samlp:Artifact',
  ArtifactAttributes,
  s.textNode
>;
export function parseArtifact(
  element: any,
): {success: false; reason: string} | {success: true; value: Artifact} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ArtifactResolveAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type ArtifactResolve = s.Element<
  'samlp:ArtifactResolve',
  ArtifactResolveAttributes,
  saml_Issuer | ds_Signature | (Extensions & Artifact)
>;
export function parseArtifactResolve(
  element: any,
): {success: false; reason: string} | {success: true; value: ArtifactResolve} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(serializeArtifact),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ArtifactResponseAttributes {
  ID: s.ID;
  InResponseTo?: s.NCName;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type ArtifactResponse = s.Element<
  'samlp:ArtifactResponse',
  ArtifactResponseAttributes,
  saml_Issuer | ds_Signature | Extensions | (Status & unknown)
>;
export function parseArtifactResponse(
  element: any,
): {success: false; reason: string} | {success: true; value: ArtifactResponse} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  if (element.attributes?.['InResponseTo'] !== undefined) {
    attributeResult = s.NCNameSchema.safeParse(
      element.attributes['InResponseTo'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['InResponseTo'] = attributeResult.value;
  }
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      parsesaml_Issuer,
      parseds_Signature,
      parseExtensions,
      parseStatus,
    ),
    s.sequenceParser(serializeUnknown),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface NewIDAttributes {}
export type NewID = s.Element<'samlp:NewID', NewIDAttributes, s.textNode>;
export function parseNewID(
  element: any,
): {success: false; reason: string} | {success: true; value: NewID} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface NewEncryptedIDAttributes {}
export type NewEncryptedID = s.Element<
  'samlp:NewEncryptedID',
  NewEncryptedIDAttributes,
  saml_EncryptedElementType
>;
export function parseNewEncryptedID(
  element: any,
): {success: false; reason: string} | {success: true; value: NewEncryptedID} {
  const attributes: any = {};
  const childrenResult = parsesaml_EncryptedElementType(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface TerminateAttributes {}
export type Terminate = s.Element<
  'samlp:Terminate',
  TerminateAttributes,
  undefined
>;
export function parseTerminate(
  element: any,
): {success: false; reason: string} | {success: true; value: Terminate} {
  const attributes: any = {};
  return {success: true, value: {attributes, children: undefined}} as any;
}
export interface ManageNameIDRequestAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type ManageNameIDRequest = s.Element<
  'samlp:ManageNameIDRequest',
  ManageNameIDRequestAttributes,
  | saml_Issuer
  | ds_Signature
  | (Extensions & saml_NameID)
  | saml_EncryptedID
  | NewID
  | NewEncryptedID
  | Terminate
>;
export function parseManageNameIDRequest(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: ManageNameIDRequest} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(
      s.choiceSerializer(serializesaml_NameID, serializesaml_EncryptedID),
      s.choiceSerializer(
        serializeNewID,
        serializeNewEncryptedID,
        serializeTerminate,
      ),
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ManageNameIDResponseAttributes {
  ID: s.ID;
  InResponseTo?: s.NCName;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type ManageNameIDResponse = s.Element<
  'samlp:ManageNameIDResponse',
  ManageNameIDResponseAttributes,
  saml_Issuer | ds_Signature | Extensions | Status
>;
export function parseManageNameIDResponse(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: ManageNameIDResponse} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  if (element.attributes?.['InResponseTo'] !== undefined) {
    attributeResult = s.NCNameSchema.safeParse(
      element.attributes['InResponseTo'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['InResponseTo'] = attributeResult.value;
  }
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parsesaml_Issuer,
    parseds_Signature,
    parseExtensions,
    parseStatus,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SessionIndexAttributes {}
export type SessionIndex = s.Element<
  'samlp:SessionIndex',
  SessionIndexAttributes,
  s.textNode
>;
export function parseSessionIndex(
  element: any,
): {success: false; reason: string} | {success: true; value: SessionIndex} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface LogoutRequestAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
  Reason?: string;
  NotOnOrAfter?: s.dateTime;
}
export type LogoutRequest = s.Element<
  'samlp:LogoutRequest',
  LogoutRequestAttributes,
  | saml_Issuer
  | ds_Signature
  | (Extensions & saml_BaseID)
  | saml_NameID
  | saml_EncryptedID
  | SessionIndex
>;
export function parseLogoutRequest(
  element: any,
): {success: false; reason: string} | {success: true; value: LogoutRequest} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  if (element.attributes?.['Reason'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['Reason']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Reason'] = attributeResult.value;
  }
  if (element.attributes?.['NotOnOrAfter'] !== undefined) {
    attributeResult = s.dateTimeSchema.safeParse(
      element.attributes['NotOnOrAfter'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['NotOnOrAfter'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(
      s.choiceSerializer(
        serializesaml_BaseID,
        serializesaml_NameID,
        serializesaml_EncryptedID,
      ),
      serializeSessionIndex,
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface LogoutResponseAttributes {
  ID: s.ID;
  InResponseTo?: s.NCName;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type LogoutResponse = s.Element<
  'samlp:LogoutResponse',
  LogoutResponseAttributes,
  saml_Issuer | ds_Signature | Extensions | Status
>;
export function parseLogoutResponse(
  element: any,
): {success: false; reason: string} | {success: true; value: LogoutResponse} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  if (element.attributes?.['InResponseTo'] !== undefined) {
    attributeResult = s.NCNameSchema.safeParse(
      element.attributes['InResponseTo'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['InResponseTo'] = attributeResult.value;
  }
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parsesaml_Issuer,
    parseds_Signature,
    parseExtensions,
    parseStatus,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface NameIDMappingRequestAttributes {
  ID: s.ID;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type NameIDMappingRequest = s.Element<
  'samlp:NameIDMappingRequest',
  NameIDMappingRequestAttributes,
  | saml_Issuer
  | ds_Signature
  | (Extensions & saml_BaseID)
  | saml_NameID
  | saml_EncryptedID
  | NameIDPolicy
>;
export function parseNameIDMappingRequest(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: NameIDMappingRequest} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parsesaml_Issuer, parseds_Signature, parseExtensions),
    s.sequenceParser(
      s.choiceSerializer(
        serializesaml_BaseID,
        serializesaml_NameID,
        serializesaml_EncryptedID,
      ),
      serializeNameIDPolicy,
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface NameIDMappingResponseAttributes {
  ID: s.ID;
  InResponseTo?: s.NCName;
  Version: string;
  IssueInstant: s.dateTime;
  Destination?: s.anyURI;
  Consent?: s.anyURI;
}
export type NameIDMappingResponse = s.Element<
  'samlp:NameIDMappingResponse',
  NameIDMappingResponseAttributes,
  | saml_Issuer
  | ds_Signature
  | Extensions
  | (Status & saml_NameID)
  | saml_EncryptedID
>;
export function parseNameIDMappingResponse(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: NameIDMappingResponse} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.IDSchema.safeParse(element.attributes['ID']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['ID'] = attributeResult.value;
  if (element.attributes?.['InResponseTo'] !== undefined) {
    attributeResult = s.NCNameSchema.safeParse(
      element.attributes['InResponseTo'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['InResponseTo'] = attributeResult.value;
  }
  attributeResult = t.String.safeParse(element.attributes['Version']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Version'] = attributeResult.value;
  attributeResult = s.dateTimeSchema.safeParse(
    element.attributes['IssueInstant'],
  );
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['IssueInstant'] = attributeResult.value;
  if (element.attributes?.['Destination'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(
      element.attributes['Destination'],
    );
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Destination'] = attributeResult.value;
  }
  if (element.attributes?.['Consent'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Consent']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Consent'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      parsesaml_Issuer,
      parseds_Signature,
      parseExtensions,
      parseStatus,
    ),
    s.choiceSerializer(serializesaml_NameID, serializesaml_EncryptedID),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
