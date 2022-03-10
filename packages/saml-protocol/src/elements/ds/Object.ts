import * as t from 'funtypes';
import * as s from '../../utils/schema';

const ObjectElement = s.element(`ds:Object`, {
  attributes: s.attributes({
    optional: {Id: t.String, MimeType: t.String, Encoding: t.String},
  }),
  elements: s.optionalList(s.unknownElement([])),
});
export default ObjectElement;
