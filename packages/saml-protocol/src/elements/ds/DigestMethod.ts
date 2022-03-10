import * as t from 'funtypes';
import * as s from '../../utils/schema';

const DigestMethodElement = s.element(`ds:DigestMethod`, {
  attributes: s.attributes({
    required: {
      Algorithm: t.String,
    },
  }),
  elements: s.optionalList(s.unknownElement([`ds`])),
});
export default DigestMethodElement;
