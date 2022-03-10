import * as t from 'funtypes';
import * as s from '../../utils/schema';

const CanonicalizationMethodElement = s.element(`ds:CanonicalizationMethod`, {
  attributes: s.attributes({
    required: {
      Algorithm: t.String,
    },
  }),
  elements: s.optionalList(s.unknownElement([])),
});
export default CanonicalizationMethodElement;
