import * as t from 'funtypes';
import * as s from '../../utils/schema';

const SignatureValueElement = s.element(`ds:SignatureValue`, {
  attributes: s.attributes({
    optional: {Id: t.String},
  }),
  elements: s.oneElement(s.base64Binary),
});
export default SignatureValueElement;
