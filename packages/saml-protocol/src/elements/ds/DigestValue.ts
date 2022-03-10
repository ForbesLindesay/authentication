import * as s from '../../utils/schema';

const DigestValueElement = s.element(`ds:DigestValue`, {
  elements: s.oneElement(s.base64Binary),
});
export default DigestValueElement;
