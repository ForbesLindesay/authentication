import * as t from 'funtypes';
import * as s from '../utils/schema';

export interface CanonicalizationMethodAttributes {
  Algorithm: s.anyURI;
}
export type CanonicalizationMethod = s.Element<
  'ds:CanonicalizationMethod',
  CanonicalizationMethodAttributes,
  unknown
>;
export function parseCanonicalizationMethod(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: CanonicalizationMethod} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Algorithm']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Algorithm'] = attributeResult.value;
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface HMACOutputLengthAttributes {}
export type HMACOutputLength = s.Element<
  'ds:HMACOutputLength',
  HMACOutputLengthAttributes,
  s.integer
>;
export function parseHMACOutputLength(
  element: any,
): {success: false; reason: string} | {success: true; value: HMACOutputLength} {
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
export interface SignatureMethodAttributes {
  Algorithm: s.anyURI;
}
export type SignatureMethod = s.Element<
  'ds:SignatureMethod',
  SignatureMethodAttributes,
  HMACOutputLength | unknown
>;
export function parseSignatureMethod(
  element: any,
): {success: false; reason: string} | {success: true; value: SignatureMethod} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Algorithm']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Algorithm'] = attributeResult.value;
  const childrenResult = s.sequenceParser(
    parseHMACOutputLength,
    parseUnknown,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface XPathAttributes {}
export type XPath = s.Element<'ds:XPath', XPathAttributes, s.textNode>;
export function parseXPath(
  element: any,
): {success: false; reason: string} | {success: true; value: XPath} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface TransformAttributes {
  Algorithm: s.anyURI;
}
export type Transform = s.Element<
  'ds:Transform',
  TransformAttributes,
  unknown | XPath
>;
export function parseTransform(
  element: any,
): {success: false; reason: string} | {success: true; value: Transform} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Algorithm']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Algorithm'] = attributeResult.value;
  const childrenResult = s.choiceParser(
    parseUnknown,
    parseXPath,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface TransformsAttributes {}
export type Transforms = s.Element<
  'ds:Transforms',
  TransformsAttributes,
  Transform
>;
export function parseTransforms(
  element: any,
): {success: false; reason: string} | {success: true; value: Transforms} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(parseTransform)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface DigestMethodAttributes {
  Algorithm: s.anyURI;
}
export type DigestMethod = s.Element<
  'ds:DigestMethod',
  DigestMethodAttributes,
  unknown
>;
export function parseDigestMethod(
  element: any,
): {success: false; reason: string} | {success: true; value: DigestMethod} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Algorithm']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Algorithm'] = attributeResult.value;
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface DigestValueAttributes {}
export type DigestValue = s.Element<
  'ds:DigestValue',
  DigestValueAttributes,
  s.base64Binary
>;
export function parseDigestValue(
  element: any,
): {success: false; reason: string} | {success: true; value: DigestValue} {
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
export interface ReferenceAttributes {
  Id?: s.ID;
  URI?: s.anyURI;
  Type?: s.anyURI;
}
export type Reference = s.Element<
  'ds:Reference',
  ReferenceAttributes,
  Transforms | DigestMethod | DigestValue
>;
export function parseReference(
  element: any,
): {success: false; reason: string} | {success: true; value: Reference} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  if (element.attributes?.['URI'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['URI']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['URI'] = attributeResult.value;
  }
  if (element.attributes?.['Type'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Type']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Type'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parseTransforms,
    parseDigestMethod,
    parseDigestValue,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SignedInfoAttributes {
  Id?: s.ID;
}
export type SignedInfo = s.Element<
  'ds:SignedInfo',
  SignedInfoAttributes,
  CanonicalizationMethod | SignatureMethod | Reference
>;
export function parseSignedInfo(
  element: any,
): {success: false; reason: string} | {success: true; value: SignedInfo} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parseCanonicalizationMethod,
    parseSignatureMethod,
    parseReference,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SignatureValueAttributes {
  Id?: s.ID;
}
export type SignatureValue = s.Element<
  'ds:SignatureValue',
  SignatureValueAttributes,
  s.base64Binary
>;
export function parseSignatureValue(
  element: any,
): {success: false; reason: string} | {success: true; value: SignatureValue} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
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
export interface KeyNameAttributes {}
export type KeyName = s.Element<'ds:KeyName', KeyNameAttributes, s.textNode>;
export function parseKeyName(
  element: any,
): {success: false; reason: string} | {success: true; value: KeyName} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface PAttributes {}
export type P = s.Element<'ds:P', PAttributes, s.base64Binary>;
export function parseP(
  element: any,
): {success: false; reason: string} | {success: true; value: P} {
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
export interface QAttributes {}
export type Q = s.Element<'ds:Q', QAttributes, s.base64Binary>;
export function parseQ(
  element: any,
): {success: false; reason: string} | {success: true; value: Q} {
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
export interface GAttributes {}
export type G = s.Element<'ds:G', GAttributes, s.base64Binary>;
export function parseG(
  element: any,
): {success: false; reason: string} | {success: true; value: G} {
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
export interface YAttributes {}
export type Y = s.Element<'ds:Y', YAttributes, s.base64Binary>;
export function parseY(
  element: any,
): {success: false; reason: string} | {success: true; value: Y} {
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
export interface JAttributes {}
export type J = s.Element<'ds:J', JAttributes, s.base64Binary>;
export function parseJ(
  element: any,
): {success: false; reason: string} | {success: true; value: J} {
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
export interface SeedAttributes {}
export type Seed = s.Element<'ds:Seed', SeedAttributes, s.base64Binary>;
export function parseSeed(
  element: any,
): {success: false; reason: string} | {success: true; value: Seed} {
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
export interface PgenCounterAttributes {}
export type PgenCounter = s.Element<
  'ds:PgenCounter',
  PgenCounterAttributes,
  s.base64Binary
>;
export function parsePgenCounter(
  element: any,
): {success: false; reason: string} | {success: true; value: PgenCounter} {
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
export interface DSAKeyValueAttributes {}
export type DSAKeyValue = s.Element<
  'ds:DSAKeyValue',
  DSAKeyValueAttributes,
  P | Q | G | Y | J | Seed | PgenCounter
>;
export function parseDSAKeyValue(
  element: any,
): {success: false; reason: string} | {success: true; value: DSAKeyValue} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    s.sequenceParser(parseP, parseQ),
    parseG,
    parseY,
    parseJ,
    s.sequenceParser(parseSeed, parsePgenCounter),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ModulusAttributes {}
export type Modulus = s.Element<
  'ds:Modulus',
  ModulusAttributes,
  s.base64Binary
>;
export function parseModulus(
  element: any,
): {success: false; reason: string} | {success: true; value: Modulus} {
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
export interface ExponentAttributes {}
export type Exponent = s.Element<
  'ds:Exponent',
  ExponentAttributes,
  s.base64Binary
>;
export function parseExponent(
  element: any,
): {success: false; reason: string} | {success: true; value: Exponent} {
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
export interface RSAKeyValueAttributes {}
export type RSAKeyValue = s.Element<
  'ds:RSAKeyValue',
  RSAKeyValueAttributes,
  Modulus | Exponent
>;
export function parseRSAKeyValue(
  element: any,
): {success: false; reason: string} | {success: true; value: RSAKeyValue} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parseModulus,
    parseExponent,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface KeyValueAttributes {}
export type KeyValue = s.Element<
  'ds:KeyValue',
  KeyValueAttributes,
  DSAKeyValue | RSAKeyValue | unknown
>;
export function parseKeyValue(
  element: any,
): {success: false; reason: string} | {success: true; value: KeyValue} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    parseDSAKeyValue,
    parseRSAKeyValue,
    parseUnknown,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface RetrievalMethodAttributes {
  URI: s.anyURI;
  Type?: s.anyURI;
}
export type RetrievalMethod = s.Element<
  'ds:RetrievalMethod',
  RetrievalMethodAttributes,
  Transforms
>;
export function parseRetrievalMethod(
  element: any,
): {success: false; reason: string} | {success: true; value: RetrievalMethod} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['URI']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['URI'] = attributeResult.value;
  if (element.attributes?.['Type'] !== undefined) {
    attributeResult = s.anyURISchema.safeParse(element.attributes['Type']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Type'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseTransforms)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface X509IssuerNameAttributes {}
export type X509IssuerName = s.Element<
  'ds:X509IssuerName',
  X509IssuerNameAttributes,
  s.textNode
>;
export function parseX509IssuerName(
  element: any,
): {success: false; reason: string} | {success: true; value: X509IssuerName} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface X509SerialNumberAttributes {}
export type X509SerialNumber = s.Element<
  'ds:X509SerialNumber',
  X509SerialNumberAttributes,
  s.integer
>;
export function parseX509SerialNumber(
  element: any,
): {success: false; reason: string} | {success: true; value: X509SerialNumber} {
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
export interface X509IssuerSerialAttributes {}
export type X509IssuerSerial = s.Element<
  'ds:X509IssuerSerial',
  X509IssuerSerialAttributes,
  X509IssuerName | X509SerialNumber
>;
export function parseX509IssuerSerial(
  element: any,
): {success: false; reason: string} | {success: true; value: X509IssuerSerial} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parseX509IssuerName,
    parseX509SerialNumber,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface X509SKIAttributes {}
export type X509SKI = s.Element<
  'ds:X509SKI',
  X509SKIAttributes,
  s.base64Binary
>;
export function parseX509SKI(
  element: any,
): {success: false; reason: string} | {success: true; value: X509SKI} {
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
export interface X509SubjectNameAttributes {}
export type X509SubjectName = s.Element<
  'ds:X509SubjectName',
  X509SubjectNameAttributes,
  s.textNode
>;
export function parseX509SubjectName(
  element: any,
): {success: false; reason: string} | {success: true; value: X509SubjectName} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface X509CertificateAttributes {}
export type X509Certificate = s.Element<
  'ds:X509Certificate',
  X509CertificateAttributes,
  s.base64Binary
>;
export function parseX509Certificate(
  element: any,
): {success: false; reason: string} | {success: true; value: X509Certificate} {
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
export interface X509CRLAttributes {}
export type X509CRL = s.Element<
  'ds:X509CRL',
  X509CRLAttributes,
  s.base64Binary
>;
export function parseX509CRL(
  element: any,
): {success: false; reason: string} | {success: true; value: X509CRL} {
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
export interface X509DataAttributes {}
export type X509Data = s.Element<
  'ds:X509Data',
  X509DataAttributes,
  | X509IssuerSerial
  | X509SKI
  | X509SubjectName
  | X509Certificate
  | X509CRL
  | unknown
>;
export function parseX509Data(
  element: any,
): {success: false; reason: string} | {success: true; value: X509Data} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    s.choiceParser(
      parseX509IssuerSerial,
      parseX509SKI,
      parseX509SubjectName,
      parseX509Certificate,
      parseX509CRL,
      parseUnknown,
    ),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface PGPKeyIDAttributes {}
export type PGPKeyID = s.Element<
  'ds:PGPKeyID',
  PGPKeyIDAttributes,
  s.base64Binary
>;
export function parsePGPKeyID(
  element: any,
): {success: false; reason: string} | {success: true; value: PGPKeyID} {
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
export interface PGPKeyPacketAttributes {}
export type PGPKeyPacket = s.Element<
  'ds:PGPKeyPacket',
  PGPKeyPacketAttributes,
  s.base64Binary
>;
export function parsePGPKeyPacket(
  element: any,
): {success: false; reason: string} | {success: true; value: PGPKeyPacket} {
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
export interface PGPDataAttributes {}
export type PGPData = s.Element<
  'ds:PGPData',
  PGPDataAttributes,
  PGPKeyID | PGPKeyPacket | unknown | PGPKeyPacket | unknown
>;
export function parsePGPData(
  element: any,
): {success: false; reason: string} | {success: true; value: PGPData} {
  const attributes: any = {};
  const childrenResult = s.choiceParser(
    s.sequenceParser(parsePGPKeyID, parsePGPKeyPacket, parseUnknown),
    s.sequenceParser(parsePGPKeyPacket, parseUnknown),
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SPKISexpAttributes {}
export type SPKISexp = s.Element<
  'ds:SPKISexp',
  SPKISexpAttributes,
  s.base64Binary
>;
export function parseSPKISexp(
  element: any,
): {success: false; reason: string} | {success: true; value: SPKISexp} {
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
export interface SPKIDataAttributes {}
export type SPKIData = s.Element<
  'ds:SPKIData',
  SPKIDataAttributes,
  SPKISexp | unknown
>;
export function parseSPKIData(
  element: any,
): {success: false; reason: string} | {success: true; value: SPKIData} {
  const attributes: any = {};
  const childrenResult = s.sequenceParser(
    parseSPKISexp,
    parseUnknown,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface MgmtDataAttributes {}
export type MgmtData = s.Element<'ds:MgmtData', MgmtDataAttributes, s.textNode>;
export function parseMgmtData(
  element: any,
): {success: false; reason: string} | {success: true; value: MgmtData} {
  const attributes: any = {};
  const childrenResult = s.textNodeSchema.safeParse(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface KeyInfoAttributes {
  Id?: s.ID;
}
export type KeyInfo = s.Element<
  'ds:KeyInfo',
  KeyInfoAttributes,
  | KeyName
  | KeyValue
  | RetrievalMethod
  | X509Data
  | PGPData
  | SPKIData
  | MgmtData
  | unknown
>;
export function parseKeyInfo(
  element: any,
): {success: false; reason: string} | {success: true; value: KeyInfo} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.choiceParser(
    parseKeyName,
    parseKeyValue,
    parseRetrievalMethod,
    parseX509Data,
    parsePGPData,
    parseSPKIData,
    parseMgmtData,
    parseUnknown,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ObjectAttributes {
  Id?: s.ID;
  MimeType?: string;
  Encoding?: s.anyURI;
}
export type Object = s.Element<'ds:Object', ObjectAttributes, unknown>;
export function parseObject(
  element: any,
): {success: false; reason: string} | {success: true; value: Object} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
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
  const childrenResult = s.sequenceParser(parseUnknown)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SignatureAttributes {
  Id?: s.ID;
}
export type Signature = s.Element<
  'ds:Signature',
  SignatureAttributes,
  SignedInfo | SignatureValue | KeyInfo | Object
>;
export function parseSignature(
  element: any,
): {success: false; reason: string} | {success: true; value: Signature} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(
    parseSignedInfo,
    parseSignatureValue,
    parseKeyInfo,
    parseObject,
  )(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface ManifestAttributes {
  Id?: s.ID;
}
export type Manifest = s.Element<'ds:Manifest', ManifestAttributes, Reference>;
export function parseManifest(
  element: any,
): {success: false; reason: string} | {success: true; value: Manifest} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseReference)(element.elements);
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
export interface SignaturePropertyAttributes {
  Target: s.anyURI;
  Id?: s.ID;
}
export type SignatureProperty = s.Element<
  'ds:SignatureProperty',
  SignaturePropertyAttributes,
  unknown
>;
export function parseSignatureProperty(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: SignatureProperty} {
  const attributes: any = {};
  let attributeResult: any;
  attributeResult = s.anyURISchema.safeParse(element.attributes['Target']);
  if (!attributeResult.success)
    return {success: false, reason: t.showError(attributeResult)};
  attributes['Target'] = attributeResult.value;
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
export interface SignaturePropertiesAttributes {
  Id?: s.ID;
}
export type SignatureProperties = s.Element<
  'ds:SignatureProperties',
  SignaturePropertiesAttributes,
  SignatureProperty
>;
export function parseSignatureProperties(
  element: any,
):
  | {success: false; reason: string}
  | {success: true; value: SignatureProperties} {
  const attributes: any = {};
  let attributeResult: any;
  if (element.attributes?.['Id'] !== undefined) {
    attributeResult = s.IDSchema.safeParse(element.attributes['Id']);
    if (!attributeResult.success)
      return {success: false, reason: t.showError(attributeResult)};
    attributes['Id'] = attributeResult.value;
  }
  const childrenResult = s.sequenceParser(parseSignatureProperty)(
    element.elements,
  );
  if (!childrenResult.success)
    return {success: false, reason: t.showError(childrenResult)};
  return {
    success: true,
    value: {attributes, children: childrenResult.value},
  } as any;
}
