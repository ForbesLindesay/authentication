import * as s from '../../utils/schema';

const X509IssuerSerialElement = s.element(`ds:X509IssuerSerial`, {
  elements: s
    .sequence()
    .required(
      `issuerName`,
      s.element(`ds:X509IssuerName`, {elements: s.oneElement(s.textNode)}),
    )
    .required(
      `serialNumber`,
      s.element(`ds:X509SerialNumber`, {elements: s.oneElement(s.integerNode)}),
    )
    .end(),
});
export default X509IssuerSerialElement;
