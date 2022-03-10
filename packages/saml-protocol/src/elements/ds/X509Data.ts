import * as t from 'funtypes';
import * as s from '../../utils/schema';
import X509IssuerSerialElement from './X509IssuerSerial';

const X509DataElement = s.element(`ds:X509Data`, {
  elements: s.requiredList(
    t.Union(
      X509IssuerSerialElement,
      s.element(`ds:X509SKI`, {elements: s.oneElement(s.base64Binary)}),
      s.element(`ds:X509SubjectName`, {elements: s.oneElement(s.textNode)}),
      s.element(`ds:X509Certificate`, {elements: s.oneElement(s.base64Binary)}),
      s.element(`ds:X509CRL`, {elements: s.oneElement(s.base64Binary)}),
      s.unknownElement([`ds`]),
    ),
  ),
});
export default X509DataElement;
