import * as t from 'funtypes';
import * as s from '../../utils/schema';

const EncryptionMethodElement = s.element(`xenc:EncryptionMethod`, {
  attributes: s.attributes({required: {Algorithm: t.String}}),
  elements: t.Union(
    t.Undefined,
    s
      .sequence()
      .optional(
        `keySize`,
        s.element(`xenc:KeySize`, {elements: s.oneElement(s.integerNode)}),
      )
      .optional(
        `oaepParams`,
        s.element(`xenc:OAEPparams`, {elements: s.oneElement(s.base64Binary)}),
      )
      .optionalList(`rest`, s.unknownElement([`other`]))
      .end(),
  ),
});
export default EncryptionMethodElement;
