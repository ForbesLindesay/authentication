import * as t from 'funtypes';
import * as s from '../../utils/schema';

const SignaturePropertyElement = s.element(`ds:SignatureProperty`, {
  attributes: s.attributes({
    required: {Target: t.String},
    optional: {Id: t.String},
  }),
  elements: s.requiredList(s.unknownElement([`ds`])),
});
export default SignaturePropertyElement;
