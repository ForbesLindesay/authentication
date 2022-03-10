import * as t from 'funtypes';
import * as s from '../../utils/schema';
import ReferenceElement from './Reference';

const ManifestElement = s.element(`ds`, {
  attributes: s.attributes({
    optional: {
      Id: t.String,
    },
  }),
  elements: s.requiredList(ReferenceElement),
});
export default ManifestElement;
