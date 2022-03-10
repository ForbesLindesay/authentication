import * as t from 'funtypes';
import * as s from '../../utils/schema';

const SignatureMethodElement = s.element(`ds:SignatureMethod`, {
  attributes: s.attributes({
    required: {
      Algorithm: t.String,
    },
  }),
  elements: s
    .sequence()
    .optional(
      `hmacOutputLength`,
      s.element(`ds:HMACOutputLength`, {elements: s.oneElement(s.integerNode)}),
    )
    .optionalList(`other`, s.unknownElement([`ds`]))
    .end(),
});
export default SignatureMethodElement;
