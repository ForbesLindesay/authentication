import * as t from 'funtypes';

export default optionalList;

function optionalList<T>(schema: t.Codec<T>): t.Codec<T[]> {
  return t.Union(
    t.Undefined.withParser({
      parse() {
        return {success: true, value: []};
      },
    }),
    t.Array(schema),
  );
}
