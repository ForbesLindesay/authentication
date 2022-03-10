import {NameFormat} from '../constants';

export interface NameIdPolicy {
  format?: NameFormat;
  /**
   * Optionally specifies that the assertion subject's identifier be returned (or created) in the namespace of
   * a service provider other than the requester, or in the namespace of an affiliation group of service
   * providers.
   */
  spNameQualifier?: string;
  /**
   * A Boolean value used to indicate whether the identity provider is allowed, in the course of fulfilling the
   * request, to create a new identifier to represent the principal.
   */
  allowCreate?: boolean;
}

/**
 * Get the XMLBuilder parameters for the NameIdPolicy element
 */
export function nameIdPolicyXml({
  format,
  spNameQualifier,
  allowCreate,
}: NameIdPolicy) {
  return {
    '@Format': format ?? undefined,
    '@SPNameQualifier': spNameQualifier ?? '',
    '@AllowCreate':
      allowCreate !== undefined ? allowCreate.toString() : undefined,
  };
}
