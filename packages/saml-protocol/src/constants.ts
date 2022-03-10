export const XMLNS = {
  SAML: 'urn:oasis:names:tc:SAML:2.0:assertion',
  SAMLP_LEGACY: 'urn:oasis:names:tc:SAML:1.1:protocol',
  SAMLP: 'urn:oasis:names:tc:SAML:2.0:protocol',
  MD: 'urn:oasis:names:tc:SAML:2.0:metadata',
  DS: 'http://www.w3.org/2000/09/xmldsig#',
  XENC: 'http://www.w3.org/2001/04/xmlenc#',
  EXC_C14N: 'http://www.w3.org/2001/10/xml-exc-c14n#',
} as const;

export enum NameFormat {
  UNSPECIFIED = 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  EMAIL_ADDRESS = 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
  PERSISTENT = 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
  TRANSIENT = 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient',
  X509_SUBJECT_NAME = 'urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName',
  WINDOWS_DOMAIN_QUALIFIED_NAME = 'urn:oasis:names:tc:SAML:1.1:nameid-format:WindowsDomainQualifiedName',
  KERBEROS = 'urn:oasis:names:tc:SAML:2.0:nameid-format:kerberos',
  ENTITY = 'urn:oasis:names:tc:SAML:2.0:nameid-format:entity',
}

export enum AuthMethod {
  PASSWORD = 'urn:oasis:names:tc:SAML:1.0:am:password',
  KERBEROS = 'urn:ietf:rfc:1510',
  SECURE_REMOTE_PASSWORD = 'urn:ietf:rfc:2945',
  HARDWARE_TOKEN_URI = 'urn:oasis:names:tc:SAML:1.0:am:HardwareToken',
  CERTIFICATE_BASED_CLIENT_AUTHENTICATION = 'urn:ietf:rfc:2246',
  PGP_PUBLIC_KEY = 'urn:oasis:names:tc:SAML:1.0:am:PGP',
  SPKI_PUBLIC_KEY = 'urn:oasis:names:tc:SAML:1.0:am:SPKI',
  XKMS_PUBLIC_KEY = 'urn:oasis:names:tc:SAML:1.0:am:XKMS',
  XML_DIGITAL_SIGNATURE = 'urn:ietf:rfc:3075',
  UNSPECIFIED = 'urn:oasis:names:tc:SAML:1.0:am:unspecified',
}

export enum AuthMethodComparison {
  exact = 'exact',
  minimum = 'minimum',
  maximum = 'maximum',
  better = 'better',
}

// https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf - 8.4
export enum ConsentIdentifier {
  UNSPECIFIED = 'urn:oasis:names:tc:SAML:2.0:consent:unspecified',
  OBTAINED = 'urn:oasis:names:tc:SAML:2.0:consent:obtained',
  PRIOR = 'urn:oasis:names:tc:SAML:2.0:consent:prior',
  IMPLICIT = 'urn:oasis:names:tc:SAML:2.0:consent:current-implicit',
  EXPLICIT = 'urn:oasis:names:tc:SAML:2.0:consent:current-explicit',
  UNAVAILABLE = 'urn:oasis:names:tc:SAML:2.0:consent:unavailable',
  INAPPLICABLE = 'urn:oasis:names:tc:SAML:2.0:consent:inapplicable',
}

export enum ProtocolBinding {
  POST = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST',
  REDIRECT = 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect',
}

/**
 * The permissible top-level <StatusCode> values are as follows
 *
 * @see https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf - 3.2.2.2
 */
export enum PrimaryStatus {
  /**
   * The request succeeded. Additional information MAY be returned in the <StatusMessage> and/or
   * <StatusDetail> elements.
   */
  Success = 'urn:oasis:names:tc:SAML:2.0:status:Success',

  /**
   * The request could not be performed due to an error on the part of the requester.
   */
  Requester = 'urn:oasis:names:tc:SAML:2.0:status:Requester',
  /**
   * The request could not be performed due to an error on the part of the SAML responder or SAML authority.
   */
  Responder = 'urn:oasis:names:tc:SAML:2.0:status:Responder',
  /**
   * The SAML responder could not process the request because the version of the request message was incorrect.
   */
  VersionMismatch = 'urn:oasis:names:tc:SAML:2.0:status:VersionMismatch',
}

/**
 * The following second-level status codes are referenced at various places in this specification. Additional
 * second-level status codes MAY be defined in future versions of the SAML specification. System entities are
 * free to define more specific status codes by defining appropriate URI references.
 *
 * @see https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf - 3.2.2.2
 */
export enum SecondaryStatus {
  /**
   * The responding provider was unable to successfully authenticate the principal.
   */
  AuthnFailed = 'urn:oasis:names:tc:SAML:2.0:status:AuthnFailed',
  /**
   * Unexpected or invalid content was encountered within a <saml:Attribute> or <saml:AttributeValue> element.
   */
  InvalidAttrNameOrValue = 'urn:oasis:names:tc:SAML:2.0:status:InvalidAttrNameOrValue',
  /**
   * The responding provider cannot or will not support the requested name identifier policy.
   */
  InvalidNameIDPolicy = 'urn:oasis:names:tc:SAML:2.0:status:InvalidNameIDPolicy',
  /**
   * The specified authentication context requirements cannot be met by the responder.
   */
  NoAuthnContext = 'urn:oasis:names:tc:SAML:2.0:status:NoAuthnContext',
  /**
   * Used by an intermediary to indicate that none of the supported identity provider <Loc> elements in an
   * <IDPList> can be resolved or that none of the supported identity providers are available.
   */
  NoAvailableIDP = 'urn:oasis:names:tc:SAML:2.0:status:NoAvailableIDP',
  /**
   * Indicates the responding provider cannot authenticate the principal passively, as has been requested.
   */
  NoPassive = 'urn:oasis:names:tc:SAML:2.0:status:NoPassive',
  /**
   * Used by an intermediary to indicate that none of the identity providers in an <IDPList> are supported
   * by the intermediary.
   */
  NoSupportedIDP = 'urn:oasis:names:tc:SAML:2.0:status:NoSupportedIDP',
  /**
   * Used by a session authority to indicate to a session participant that it was not able to propagate
   * logout to all other session participants.
   */
  PartialLogout = 'urn:oasis:names:tc:SAML:2.0:status:PartialLogout',
  /**
   * Indicates that a responding provider cannot authenticate the principal directly and is not permitted
   * to proxy the request further.
   */
  ProxyCountExceeded = 'urn:oasis:names:tc:SAML:2.0:status:ProxyCountExceeded',
  /**
   * The SAML responder or SAML authority is able to process the request but has chosen not to respond. This
   * status code MAY be used when there is concern about the security context of the request message or the
   * sequence of request messages received from a particular requester.
   */
  RequestDenied = 'urn:oasis:names:tc:SAML:2.0:status:RequestDenied',
  /**
   * The SAML responder or SAML authority does not support the request.
   */
  RequestUnsupported = 'urn:oasis:names:tc:SAML:2.0:status:RequestUnsupported',
  /**
   * The SAML responder cannot process any requests with the protocol version specified in the request.
   */
  RequestVersionDeprecated = 'urn:oasis:names:tc:SAML:2.0:status:RequestVersionDeprecated',
  /**
   * The SAML responder cannot process the request because the protocol version specified in the request message
   * is a major upgrade from the highest protocol version supported by the responder.
   */
  RequestVersionTooHigh = 'urn:oasis:names:tc:SAML:2.0:status:RequestVersionTooHigh',
  /**
   * The SAML responder cannot process the request because the protocol version specified in the request message
   * is too low.
   */
  RequestVersionTooLow = 'urn:oasis:names:tc:SAML:2.0:status:RequestVersionTooLow',
  /**
   * The resource value provided in the request message is invalid or unrecognized.
   */
  ResourceNotRecognized = 'urn:oasis:names:tc:SAML:2.0:status:ResourceNotRecognized',
  /**
   * The response message would contain more elements than the SAML responder is able to return.
   */
  TooManyResponses = 'urn:oasis:names:tc:SAML:2.0:status:TooManyResponses',
  /**
   * An entity that has no knowledge of a particular attribute profile has been presented with an attribute
   * drawn from that profile.
   */
  UnknownAttrProfile = 'urn:oasis:names:tc:SAML:2.0:status:UnknownAttrProfile',
  /**
   * The responding provider does not recognize the principal specified or implied by the request.
   */
  UnknownPrincipal = 'urn:oasis:names:tc:SAML:2.0:status:UnknownPrincipal',
  /**
   * The SAML responder cannot properly fulfill the request using the protocol binding specified in the request.
   */
  UnsupportedBinding = 'urn:oasis:names:tc:SAML:2.0:status:UnsupportedBinding',
}

export const SEARCH_PARAMS = {
  SAMLRequest: 'SAMLRequest',
  SAMLResponse: 'SAMLResponse',
  RelayState: 'RelayState',
  SigAlg: 'SigAlg',
  Signature: 'Signature',
} as const;

export const SIGNATURE_ALGORITHM = {
  'rsa-sha256': 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256',
  'rsa-sha1': 'http://www.w3.org/2000/09/xmldsig#rsa-sha1',
} as const;

export const DIGEST_ALGORITHM = {
  sha256: 'http://www.w3.org/2001/04/xmlenc#sha256',
  sha1: 'http://www.w3.org/2000/09/xmldsig#sha1',
} as const;

export const KEY_TYPE = {
  PRIVATE_KEY: 'PRIVATE KEY',
  CERTIFICATE: 'CERTIFICATE',
};
