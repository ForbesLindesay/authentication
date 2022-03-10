import {NameFormat} from '../constants';

interface NameIdObject {
  nameQualifier?: string;
  spNameQualifier?: string;
  format?: NameFormat;
  spProvidedId?: string;
  value: string;
}
export type NameId = string | NameIdObject;

/**
 * Get the XMLBuilder parameters for the NameId element
 */
export function nameIdXml(n: NameId) {
  if (typeof n === 'string') {
    return {'#': n};
  }
  const {nameQualifier, spNameQualifier, format, spProvidedId, value} = n;
  return {
    '@NameQualifier': nameQualifier,
    '@SPNameQualifier': spNameQualifier,
    '@Format': format,
    '@SPProvidedID': spProvidedId,
    '#': value,
  };
}
