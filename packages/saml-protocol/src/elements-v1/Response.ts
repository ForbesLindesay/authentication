import {Assertion, assertionXml} from './Assertion';
import {StatusResponse, statusResponseXml} from './StatusResponse';

// See 3.3.3 https://docs.oasis-open.org/security/saml/v2.0/saml-core-2.0-os.pdf
/**
 * The <Response> message element is used when a response consists of a list of zero or more assertions
 * that satisfy the request. It has the complex type ResponseType, which extends StatusResponseType
 * and adds the following elements:
 */
export interface Response extends StatusResponse {
  assertions: Assertion[];
  // TODO: encrypted assertion
}

/**
 * Get the XMLBuilder parameters for the Response element
 */
export function responseXml({assertions, ...response}: Response) {
  return {
    ...statusResponseXml(response),
    'saml:Assertion': assertions.map(assertionXml),
  };
}
