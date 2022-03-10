import * as t from 'funtypes';
import * as s from '../../utils/schema';

function cryptoBinaryElement<TName extends string>(
  name: TName,
): t.Codec<s.Element<`ds:${TName}`, undefined, Buffer>> {
  return s.element(`ds:${name}`, {elements: s.base64Binary});
}
const RSAKeyValueElement = s.element(`ds:RSAKeyValue`, {
  elements: s
    .sequence()
    .required(`modulus`, cryptoBinaryElement(`Modulus`))
    .required(`exponent`, cryptoBinaryElement(`Exponent`))
    .end(),
});
export default RSAKeyValueElement;
