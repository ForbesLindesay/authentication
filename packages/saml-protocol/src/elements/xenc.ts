import * as t from 'funtypes';
import * as s from '../utils/schema';

export interface CipherValueAttributes {}
export type CipherValue = s.Element<
  'xenc:CipherValue',
  CipherValueAttributes,
  s.base64Binary
>;
export function parseCipherValue(
  element: any,
): {success: false; reason: string} | {success: true; value: CipherValue} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.base64BinarySchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface TransformsAttributes {}
export type Transforms = s.Element<
  'xenc:Transforms',
  TransformsAttributes,
  ds_Transform
>;
export function parseTransforms(
  element: any,
): {success: false; reason: string} | {success: true; value: Transforms} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(parseds_Transform)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface CipherReferenceAttributes {
  URI: s.anyURI;
}
export type CipherReference = s.Element<
  'xenc:CipherReference',
  CipherReferenceAttributes,
  Transforms
>;
export function parseCipherReference(
  element: any,
): {success: false; reason: string} | {success: true; value: CipherReference} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['URI']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['URI'] = attributeResult.value;
  const childrenResult = s.choiceParser(parseTransforms)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface CipherDataAttributes {}
export type CipherData = s.Element<
  'xenc:CipherData',
  CipherDataAttributes,
  CipherValue | CipherReference
>;
export function parseCipherData(
  element: any,
): {success: false; reason: string} | {success: true; value: CipherData} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    parseCipherValue,
    parseCipherReference,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface KeySizeAttributes {}
export type KeySize = s.Element<'xenc:KeySize', KeySizeAttributes, s.integer>;
export function parseKeySize(
  element: any,
): {success: false; reason: string} | {success: true; value: KeySize} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.integerSchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface OAEPparamsAttributes {}
export type OAEPparams = s.Element<
  'xenc:OAEPparams',
  OAEPparamsAttributes,
  s.base64Binary
>;
export function parseOAEPparams(
  element: any,
): {success: false; reason: string} | {success: true; value: OAEPparams} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.base64BinarySchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptionMethodAttributes {
  Algorithm: s.anyURI;
}
export type EncryptionMethod = s.Element<
  'xenc:EncryptionMethod',
  EncryptionMethodAttributes,
  KeySize | OAEPparams | unknown
>;
export function parseEncryptionMethod(
  element: any,
): {success: false; reason: string} | {success: true; value: EncryptionMethod} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Algorithm']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Algorithm'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    parseKeySize,
    parseOAEPparams,
    parseUnknown,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptionPropertyAttributes {
  Target?: s.anyURI;
  Id?: s.ID;
}
export type EncryptionProperty = s.Element<
  'xenc:EncryptionProperty',
  EncryptionPropertyAttributes,
  unknown
>;
export function parseEncryptionProperty(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: EncryptionProperty} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Target'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Target']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Target'] = attributeResult.value;
  }
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.choiceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptionPropertiesAttributes {
  Id?: s.ID;
}
export type EncryptionProperties = s.Element<
  'xenc:EncryptionProperties',
  EncryptionPropertiesAttributes,
  EncryptionProperty
>;
export function parseEncryptionProperties(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: EncryptionProperties} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseEncryptionProperty)(
    element.elements,
  );
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptedDataAttributes {
  Id?: s.ID;
  Type?: s.anyURI;
  MimeType?: string;
  Encoding?: s.anyURI;
}
export type EncryptedData = s.Element<
  'xenc:EncryptedData',
  EncryptedDataAttributes,
  EncryptionMethod | ds_KeyInfo | CipherData | EncryptionProperties
>;
export function parseEncryptedData(
  element: any,
): {success: false; reason: string} | {success: true; value: EncryptedData} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  if (element.attributes?.['Type'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Type']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Type'] = attributeResult.value;
  }
  if (element.attributes?.['MimeType'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['MimeType']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['MimeType'] = attributeResult.value;
  }
  if (element.attributes?.['Encoding'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Encoding']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Encoding'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parseEncryptionMethod,
    parseds_KeyInfo,
    parseCipherData,
    parseEncryptionProperties,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface DataReferenceAttributes {
  URI: s.anyURI;
}
export type DataReference = s.Element<
  'xenc:DataReference',
  DataReferenceAttributes,
  unknown
>;
export function parseDataReference(
  element: any,
): {success: false; reason: string} | {success: true; value: DataReference} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['URI']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['URI'] = attributeResult.value;
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface KeyReferenceAttributes {
  URI: s.anyURI;
}
export type KeyReference = s.Element<
  'xenc:KeyReference',
  KeyReferenceAttributes,
  unknown
>;
export function parseKeyReference(
  element: any,
): {success: false; reason: string} | {success: true; value: KeyReference} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['URI']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['URI'] = attributeResult.value;
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ReferenceListAttributes {}
export type ReferenceList = s.Element<
  'xenc:ReferenceList',
  ReferenceListAttributes,
  DataReference | KeyReference
>;
export function parseReferenceList(
  element: any,
): {success: false; reason: string} | {success: true; value: ReferenceList} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    parseDataReference,
    parseKeyReference,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface CarriedKeyNameAttributes {}
export type CarriedKeyName = s.Element<
  'xenc:CarriedKeyName',
  CarriedKeyNameAttributes,
  s.textNode
>;
export function parseCarriedKeyName(
  element: any,
): {success: false; reason: string} | {success: true; value: CarriedKeyName} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface EncryptedKeyAttributes {
  Id?: s.ID;
  Type?: s.anyURI;
  MimeType?: string;
  Encoding?: s.anyURI;
  Recipient?: string;
}
export type EncryptedKey = s.Element<
  'xenc:EncryptedKey',
  EncryptedKeyAttributes,
  | EncryptionMethod
  | ds_KeyInfo
  | CipherData
  | (EncryptionProperties & ReferenceList)
  | CarriedKeyName
>;
export function parseEncryptedKey(
  element: any,
): {success: false; reason: string} | {success: true; value: EncryptedKey} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  if (element.attributes?.['Type'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Type']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Type'] = attributeResult.value;
  }
  if (element.attributes?.['MimeType'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['MimeType']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['MimeType'] = attributeResult.value;
  }
  if (element.attributes?.['Encoding'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Encoding']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Encoding'] = attributeResult.value;
  }
  if (element.attributes?.['Recipient'] !== undefined) {
    attributeResult = t.String.safeParse(element.attributes['Recipient']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Recipient'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    s.sequenceParser(
      parseEncryptionMethod,
      parseds_KeyInfo,
      parseCipherData,
      parseEncryptionProperties,
    ),
    s.sequenceParser(serializeReferenceList, serializeCarriedKeyName),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface KA_NonceAttributes {}
export type KA_Nonce = s.Element<
  'xenc:KA-Nonce',
  KA_NonceAttributes,
  s.base64Binary
>;
export function parseKA_Nonce(
  element: any,
): {success: false; reason: string} | {success: true; value: KA_Nonce} {
  const attributes: any = {};
  const childrenResult = s
    .textNodeSchemaOf(s.base64BinarySchema)
    .safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface OriginatorKeyInfoAttributes {}
export type OriginatorKeyInfo = s.Element<
  'xenc:OriginatorKeyInfo',
  OriginatorKeyInfoAttributes,
  ds_KeyInfoType
>;
export function parseOriginatorKeyInfo(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: OriginatorKeyInfo} {
  const attributes: any = {};
  const childrenResult = parseds_KeyInfoType(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface RecipientKeyInfoAttributes {}
export type RecipientKeyInfo = s.Element<
  'xenc:RecipientKeyInfo',
  RecipientKeyInfoAttributes,
  ds_KeyInfoType
>;
export function parseRecipientKeyInfo(
  element: any,
): {success: false; reason: string} | {success: true; value: RecipientKeyInfo} {
  const attributes: any = {};
  const childrenResult = parseds_KeyInfoType(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface AgreementMethodAttributes {
  Algorithm: s.anyURI;
}
export type AgreementMethod = s.Element<
  'xenc:AgreementMethod',
  AgreementMethodAttributes,
  KA_Nonce | unknown | OriginatorKeyInfo | RecipientKeyInfo
>;
export function parseAgreementMethod(
  element: any,
): {success: false; reason: string} | {success: true; value: AgreementMethod} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Algorithm']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Algorithm'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    parseKA_Nonce,
    parseUnknown,
    parseOriginatorKeyInfo,
    parseRecipientKeyInfo,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
