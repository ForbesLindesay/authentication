import {NameIdPolicy, nameIdPolicyXml} from './NameIDPolicy';
import {Conditions, conditionsXml} from './Conditions';
import {
  RequestedAuthnContext,
  requestedAuthnContextXml,
} from './RequestedAuthnContext';
import {Scoping, scopingXml} from './Scoping';
import {ProtocolBinding} from '../constants';
import {
  RequestAbstractType,
  requestAbstractTypeXml,
} from './RequestAbstractType';

// See 3.4.1 https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf
export interface AuthnRequest extends RequestAbstractType {
  /**
   * Specifies constraints on the name identifier to be used to represent the requested subject.
   * If omitted, then any type of identifier supported by the identity provider for the requested
   * subject can be used, constrained by any relevant deployment-specific policies, with respect
   * to privacy, for example.
   */
  nameIdPolicy?: NameIdPolicy;
  /**
   * Specifies the SAML conditions the requester expects to limit the validity and/or use of the resulting
   * assertion(s). The responder MAY modify or supplement this set as it deems necessary. The
   * information in this element is used as input to the process of constructing the assertion, rather than as
   * conditions on the use of the request itself.
   */
  conditions?: Conditions;
  /**
   * Specifies the requirements, if any, that the requester places on the authentication context that applies
   * to the responding provider's authentication of the presenter.
   */
  context?: RequestedAuthnContext;
  /**
   * Specifies a set of identity providers trusted by the requester to authenticate the presenter
   */
  scoping?: Scoping;
  /**
   * If "force_auth", the identity provider MUST authenticate the presenter directly rather than
   * rely on a previous security context.
   *
   * If "passive", the identity provider and the user agent itself MUST NOT visibly take control
   * of the user interface from the requester and interact with the presenter in a noticeable fashion.
   */
  mode?: 'auto' | 'passive' | 'force_auth';
  /**
   * Indirectly identifies the location to which the <Response> message should be returned to the
   * requester.
   *
   * Normally you will specify assertionConsumerServiceUrl instead.
   */
  assertionConsumerServiceIndex?: number;
  /**
   * Specifies by value the location to which the <Response> message MUST be returned to the
   * requester.
   */
  assertionConsumerServiceUrl?: URL;
  /**
   * A URI reference that identifies a SAML protocol binding to be used when returning the <Response>
   * message.
   */
  protocolBinding?: ProtocolBinding;
  /**
   * Indirectly identifies information associated with the requester describing the SAML attributes the
   * requester desires or requires to be supplied by the identity provider in the <Response> message
   */
  attributeConsumingServiceIndex?: number;
  /**
   * Specifies the human-readable name of the requester for use by the presenter's user agent or the
   * identity provider.
   */
  providerName?: string;

  // TODO: <saml:Subject>
}

/**
 *  Creates an AuthnRequest and returns it as a string of xml along with the randomly generated ID for the created
 *  request.
 */
export function authnRequestXml({
  nameIdPolicy,
  conditions,
  context,
  scoping,
  mode,
  assertionConsumerServiceIndex,
  assertionConsumerServiceUrl: assertionConsumerServiceURL,
  protocolBinding,
  attributeConsumingServiceIndex,
  providerName,
  ...baseRequest
}: AuthnRequest) {
  return {
    ...requestAbstractTypeXml(baseRequest),
    NameIDPolicy: nameIdPolicy ? nameIdPolicyXml(nameIdPolicy) : undefined,
    'saml:Conditions': conditions ? conditionsXml(conditions) : undefined,
    RequestedAuthnContext: context
      ? requestedAuthnContextXml(context)
      : undefined,
    Scoping: scoping ? scopingXml(scoping) : undefined,
    '@ForceAuthn': mode === 'force_auth',
    '@IsPassive': mode === 'passive',
    '@AssertionConsumerServiceURL': assertionConsumerServiceIndex,
    '@AssertionConsumerServiceIndex': assertionConsumerServiceURL?.href,
    '@ProtocolBinding': protocolBinding,
    '@AttributeConsumingServiceIndex': attributeConsumingServiceIndex,
    '@ProviderName': providerName,
  };
}
