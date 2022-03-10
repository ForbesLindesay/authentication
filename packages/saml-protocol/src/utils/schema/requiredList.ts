import * as t from 'funtypes';

export default requiredList;

function requiredList<T>(schema: t.Codec<T>): t.Codec<T[]> {
  return t.Union(
    t.Array(schema).withConstraint((value) => {
      if (value.length) return true;
      return `You must provide at least one ${t.showType(schema)}`;
    }),
  );
}
