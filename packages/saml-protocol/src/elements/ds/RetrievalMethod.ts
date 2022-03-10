import * as t from 'funtypes';
import * as s from '../../utils/schema';
import TransformsElement from './Transforms';

const RetrievalMethodElement = s.element(`ds:RetrievalMethod`, {
  attributes: s.attributes({
    required: {URI: t.String},
    optional: {Type: t.String},
  }),
  elements: t.Union(t.Undefined, s.oneElement(TransformsElement)),
});
export default RetrievalMethodElement;
