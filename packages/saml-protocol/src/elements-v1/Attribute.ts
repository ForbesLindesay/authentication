import {NameFormat} from '../constants';

export interface Attribute {
  name: string;
  nameFormat?: NameFormat;
  friendlyName?: string;
  values: (string | number | boolean | null)[];
}

/**
 * Get the XMLBuilder parameters for the Attribute element
 */
export function attributeXml({
  name,
  nameFormat,
  friendlyName,
  values,
}: Attribute) {
  return {
    '@Name': name,
    '@NameFormat': nameFormat,
    '@FriendlyName': friendlyName,
    AttributeValue: values.map((v) => ({
      'xsi:nil': v === null ? `true` : undefined,
      '#': v === null ? undefined : v,
    })),
  };
}
