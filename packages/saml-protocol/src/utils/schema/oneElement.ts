import * as t from 'funtypes';

export default oneElement;

function oneElement<T>(schema: t.Codec<T>) {
  return t.Tuple(schema).withParser<T>({
    test: schema,
    parse(value) {
      return {success: true, value: value[0]};
    },
    serialize(value) {
      const r = schema.safeParse(value);
      if (!r.success) {
        return r;
      }
      return {success: true, value: [r.value]};
    },
  });
}
