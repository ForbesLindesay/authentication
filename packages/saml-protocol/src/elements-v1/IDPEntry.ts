export interface IDPEntry {
  providerId: URL;
  name?: string;
  loc?: URL;
}

/**
 * Get the XMLBuilder parameters for the IDPEntry element
 */
export function idpEntryXml({providerId, name, loc}: IDPEntry) {
  return {
    '@ProviderID': providerId.href,
    '@Name': name,
    '@Loc': loc?.href,
  };
}
