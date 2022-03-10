import * as t from 'funtypes';
import * as s from '../../utils/schema';

const PGPDataElement = s.element(`ds:PGPData`, {
  elements: t.Union(
    s
      .sequence()
      .required(
        `keyId`,
        s.element(`ds:PGPKeyID`, {elements: s.oneElement(s.base64Binary)}),
      )
      .optional(
        `keyPacket`,
        s.element(`ds:PGPKeyPacket`, {elements: s.oneElement(s.base64Binary)}),
      )
      .optionalList(`rest`, s.unknownElement([`ds`]))
      .end(),
    s
      .sequence()
      .required(
        `keyPacket`,
        s.element(`ds:PGPKeyPacket`, {elements: s.oneElement(s.base64Binary)}),
      )
      .optionalList(`rest`, s.unknownElement([`ds`]))
      .end(),
  ),
});
export default PGPDataElement;
