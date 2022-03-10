import {IDPList, idpListXml} from './IDPList';

export interface Scoping {
  proxyCount?: number;
  idpList?: IDPList;
  requesterIds?: URL[];
}

/**
 * Get the XMLBuilder parameters for the Scoping element
 */
export function scopingXml({proxyCount, requesterIds, idpList}: Scoping) {
  return {
    '@ProxyCount': proxyCount,
    IDPList: idpList ? idpListXml(idpList) : undefined,
    RequesterID: requesterIds?.map((u) => u.href),
  };
}
