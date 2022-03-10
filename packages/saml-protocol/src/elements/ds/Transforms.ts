import * as s from '../../utils/schema';
import TransformElement from './Transform';

const TransformsElement = s.element(`ds:Transforms`, {
  elements: s.requiredList(TransformElement),
});
export default TransformsElement;
