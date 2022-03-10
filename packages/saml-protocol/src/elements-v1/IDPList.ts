import {IDPEntry, idpEntryXml} from './IDPEntry';

export interface IDPList {
  /**
   * Information about each identity provider
   */
  entries: [IDPEntry, ...IDPEntry[]];
  /**
   * If the <IDPList> is not complete, using this element specifies a URI reference that can be used to
   * retrieve the complete list
   */
  getComplete?: URL;
}

/**
 * Get the XMLBuilder parameters for the IDPList element
 */
export function idpListXml({entries, getComplete}: IDPList) {
  return {
    IDPEntry: entries.map(idpEntryXml),
    GetComplete: getComplete?.href,
  };
}
