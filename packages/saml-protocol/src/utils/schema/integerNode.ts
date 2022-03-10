import * as t from 'funtypes';
import textNode from './textNode';

const integerNode = textNode.withParser<number>({
  name: `Integer`,
  test: t.Number.withConstraint((v) => v === (v | 0), {name: `Integer`}),
  parse(value) {
    if (!/^\d+$/.test(value)) {
      return {
        success: false,
        message: `Expected an integer but got ${t.showValue(value)}`,
      };
    }
    return {success: true, value: parseInt(value, 10)};
  },
  serialize(value) {
    return {success: true, value: value.toString(10)};
  },
});
export default integerNode;
