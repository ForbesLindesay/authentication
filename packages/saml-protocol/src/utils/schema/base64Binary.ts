import * as t from 'funtypes';

const base64Binary = t.ParsedValue<t.Codec<string>, Buffer>(t.String, {
  name: `Buffer`,
  test: t.Unknown.withGuard(Buffer.isBuffer, {name: `Buffer`}),
  parse(value) {
    return {success: true, value: Buffer.from(value, `base64`)};
  },
  serialize(value) {
    return {success: true, value: value.toString(`base64`)};
  },
});
export default base64Binary;
