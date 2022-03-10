export interface Conditions {
  notBefore?: Date;
  notOnOrAfter?: Date;
  /**
   * Note that multiple <AudienceRestriction> elements MAY be included in a single assertion, and each
   * MUST be evaluated independently. The effect of this requirement and the preceding definition is that
   * within a given condition, the audiences form a disjunction (an "OR") while multiple conditions form a
   * conjunction (an "AND").
   */
  audienceRestriction?: {
    allOf: {anyOf: URL[]}[];
  };
  // TODO: <Condition>
  // TODO: <OneTimeUse>
  // TODO: <ProxyRestriction>
}

/**
 * Get the XMLBuilder parameters for the Conditions element
 */
export function conditionsXml({
  notBefore,
  notOnOrAfter,
  audienceRestriction,
}: Conditions) {
  return {
    '@NotBefore': notBefore?.toISOString(),
    '@NotOnOrAfter': notOnOrAfter?.toISOString(),
    AudienceRestriction: audienceRestriction?.allOf.map(({anyOf}) => ({
      Audience: anyOf,
    })),
  };
}
