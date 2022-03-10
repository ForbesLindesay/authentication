import * as t from 'funtypes';

enum ChildNodeKind {
  Element = 'element',
  OptionalElement = 'optional',
  RepeatedElement = 'repeated',
  Choice = 'choice',
  Sequence = 'sequence',
}
interface ChildNodeSchema<T> {
  end(): t.Codec<T>;
}
type Static<T> = T extends ChildNodeSchema<infer S> ? S : unknown;

export interface Element<TName, TAttributes, TElements> {
  type: 'element';
  name: TName;
  attributes: TAttributes;
  elements: TElements;
}
export default element;

export interface ElementSchema<TName, TAttributes, TElements>
  extends ChildNodeSchema<Element<TName, TAttributes, TElements>> {
  kind: ChildNodeKind.Element;
  name: TName;
  attributes: t.Codec<TAttributes>;
  elements: t.Codec<TElements>;
}
export function elementSchemaToCodec<
  TName extends string,
  TAttributes,
  TElements,
>(
  schema: ElementSchema<TName, TAttributes, TElements>,
): t.Codec<Element<TName, TAttributes, TElements>> {
  return t.Named(
    `<${name}>`,
    t.Object({
      type: t.Literal('element'),
      name: t.Literal(schema.name),
      attributes: schema.attributes,
      elements: schema.elements,
    }),
  ) as any;
}

function element<TName extends string>(
  name: TName,
): ElementSchema<TName, undefined, undefined>;
function element<TName extends string, TAttributes>(
  name: TName,
  options: {attributes: t.Runtype<TAttributes>},
): ElementSchema<TName, TAttributes, undefined>;
function element<TName extends string, TElements>(
  name: TName,
  options: {elements: t.Runtype<TElements>},
): ElementSchema<TName, undefined, TElements>;
function element<TName extends string, TAttributes, TElements>(
  name: TName,
  options: {
    attributes: t.Runtype<TAttributes>;
    elements: t.Runtype<TElements>;
  },
): ElementSchema<TName, TAttributes, TElements>;
function element<
  TName extends string,
  TAttributes = undefined,
  TElements = undefined,
>(
  name: TName,
  {
    attributes,
    elements,
  }: {
    attributes?: t.Runtype<TAttributes>;
    elements?: t.Runtype<TElements>;
  } = {},
): ElementSchema<TName, TAttributes, TElements> {
  return {
    name: name,
    attributes: attributes ?? t.Undefined,
    elements: elements ?? t.Undefined,
    end() {
      return t.Named(
        `<${name}>`,
        t.Object({
          type: t.Literal('element'),
          name: t.Literal(name),
          attributes: attributes ?? t.Undefined,
          elements: elements ?? t.Undefined,
        }),
      );
    },
  } as any;
}

export interface Choice<TElements extends readonly unknown[]>
  extends ChildNodeSchema<Static<TElements[number]>> {
  kind: ChildNodeKind.Choice;
  elements: TElements;
}

export function choice<TElements extends readonly unknown[]>(
  ...elements: TElements
): Choice<TElements> {
  return {
    kind: ChildNodeKind.Choice,
    elements,
    end(): any {
      return t.Union(...(elements.map((e: any) => e.end()) as any));
    },
  };
}

export interface Sequence<T> extends ChildNodeSchema<T> {
  kind: ChildNodeKind.Sequence;
  elements: any[];
  pushNamed<TName extends string, TChild>(
    name: TName,
    child: TChild,
  ): Sequence<T & {[k in TName]: TChild}>;
}

export function sequence(): Sequence<{}> {
  return internalSequence([]);
}
function internalSequence(elements: any[]): Sequence<any> {
  return {
    kind: ChildNodeKind.Sequence,
    elements,
    pushNamed(name, child) {
      return internalSequence([...elements, [name, child]]);
    },
    end() {
      // TODO
      return null as any;
    },
  };
}

export interface RepeatedElement<T> extends ChildNodeSchema<T[]> {
  kind: ChildNodeKind.RepeatedElement;
  element: any;
}
export function repeatedElement<T>(element: T): RepeatedElement<Static<T>> {
  return {
    kind: ChildNodeKind.RepeatedElement,
    element,
    end(): any {
      return t.Array((element as any).end());
    },
  };
}
export interface OptionalElement<T> extends ChildNodeSchema<T[]> {
  kind: ChildNodeKind.OptionalElement;
  element: any;
}
export function optionalElement<T>(element: T): OptionalElement<Static<T>> {
  return {
    kind: ChildNodeKind.OptionalElement,
    element,
    end(): any {
      return t.Union(t.Undefined, (element as any).end());
    },
  };
}
// sequence,
// repeatedElement,
// optionalElement,
