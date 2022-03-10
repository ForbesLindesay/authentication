import {AuthMethod, AuthMethodComparison} from '../constants';

export interface RequestedAuthnContext {
  comparison?: AuthMethodComparison;
  classRefs: AuthMethod[];
}

/**
 * Get the XMLBuilder parameters for the RequestedAuthnContext element
 */
export function requestedAuthnContextXml({
  classRefs,
  comparison,
}: RequestedAuthnContext) {
  return {
    '@Comparison': comparison,
    'saml:AuthnContextClassRef': classRefs,
  };
}
