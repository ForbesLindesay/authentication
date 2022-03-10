import {readFileSync, writeFileSync} from 'fs';
import {spawnSync} from 'child_process';

const {xml2js} = require('xml-js');

interface Attribute {
  optional: boolean;
  name: string;
  type: string;
  schema: string;
}

interface Child {
  typeName: string;
  // fn(elements: unknown[], elementsIndex: number, state: unknown): {success: true, elementsIndex: number, state: any} | {success: false, message: string}
  parseFnName: string;
  serializeFnName: string;
}

// enum ChildKind {
//   ChildElement = 'ChildElement',
//   OptionalChild = 'OptionalChild',
// }
// interface ChildElement {
//   kind: ChildKind.ChildElement;
//   typeName: string;
//   parseFn: string;
//   serializeFn: string;
// }
// interface OptionalChild {
//   kind: ChildKind.OptionalChild;
//   element: Child;
// }
// type Child = ChildElement | OptionalChild;

function handle(prefix: string, filename: string) {
  const output = [];
  const imports = [
    `import * as t from 'funtypes';`,
    `import * as s from '../utils/schema';`,
  ];
  const addedImports = new Set<string>();
  function addImport(name: string) {
    if (addedImports.has(name)) return;
    addedImports.add(name);
    imports.push(`import * as ${name} from './${name}';`);
  }

  const schemaDoc = xml2js(readFileSync(`${__dirname}/${filename}`, `utf8`));
  writeFileSync(
    `${__dirname}/${filename.replace(/\.xsd$/, '.json')}`,
    JSON.stringify(schemaDoc, null, `  `) + '\n',
  );
  const schema = schemaDoc.elements.find((e: any) => e.name === 'schema');
  const types = new Map<string, any>();
  for (const element of schema.elements) {
    if (element.type === 'comment') {
      continue;
    }
    switch (element.name) {
      case 'import':
        break;
      case 'annotation': {
        // output.push(`/**`);
        // const str = element.elements[0].elements[0].text;
        // let lines = str.split(/\r?\n/);
        // lines = lines.slice(lines.findIndex((str) => !!str.trim()));
        // lines.reverse();
        // lines = lines.slice(lines.findIndex((str) => !!str.trim()));
        // lines.reverse();

        // const prefixLength = Math.min(
        //   ...lines
        //     .filter((l) => l.trim())
        //     .map((l) => /^\s*/.exec(l)![0].length),
        // );

        // output.push(
        //   ...lines.map((l) =>
        //     l.trim() ? ` * ${l.substr(prefixLength).trimEnd()}` : ` *`,
        //   ),
        // );

        // output.push(` */`);
        break;
      }
      case 'complexType':
      case 'simpleType':
      case 'element':
      case 'attributeGroup':
        if (typeof element.attributes.name !== 'string') {
          throw new Error(`Missing element name: ${JSON.stringify(element)}`);
        }
        types.set(element.attributes.name, element);
        break;
      default:
        throw new Error(`Unsupported element ${element.name}`);
    }
  }
  function getNames(elementName: string): {
    attributesTypeName: string;
    typeName: string;
    parseFnName: string;
    serializeFnName: string;
  } {
    const rawName = (
      elementName.startsWith(`${prefix}:`)
        ? elementName.substring(`${prefix}:`.length)
        : elementName
    ).replace(/[^a-z0-9]/gi, `_`);
    if (rawName.split(`:`).length === 2) {
      const [namespace, name] = rawName.split(`:`);
      addImport(namespace);
      const names = getNames(name);
      return {
        attributesTypeName: `${namespace}.${names.attributesTypeName}`,
        typeName: `${namespace}.${names.typeName}`,
        parseFnName: `${namespace}.${names.parseFnName}`,
        serializeFnName: `${namespace}.${names.serializeFnName}`,
      };
    }
    return {
      attributesTypeName: `${rawName}Attributes`,
      typeName: rawName,
      parseFnName: `parse${rawName}`,
      serializeFnName: `serialize${rawName}`,
    };
  }
  function writeElementType(
    elementName: string,
    {
      attributes,
      body,
    }: {
      attributes: Attribute[];
      // TODO
      extensibleAttributes?: boolean;
      body?: Child;
    },
  ) {
    const {attributesTypeName, typeName, parseFnName} = getNames(elementName);
    output.push(
      `export interface ${attributesTypeName} {\n${attributes
        .map((a) => `${a.name}${a.optional ? `?` : ``}: ${a.type}\n`)
        .join(``)}}`,
    );
    output.push(
      `export type ${typeName} = s.Element<'${elementName}', ${typeName}Attributes, ${
        body?.typeName ?? `undefined`
      }>`,
    );
    output.push(
      `export function ${parseFnName}(element: any): {success: false, reason: string} | {success: true, value: ${typeName}} {`,
    );
    output.push(`const attributes: any = {};`);
    if (attributes.length) {
      output.push(`let attributeResult: any;`);
      for (const a of attributes) {
        if (a.optional) {
          output.push(
            `if (element.attributes?.[${JSON.stringify(
              a.name,
            )}] !== undefined) {`,
          );
        }
        output.push(
          `attributeResult = ${
            a.schema
          }.safeParse(element.attributes[${JSON.stringify(a.name)}])`,
        );
        output.push(
          `if (!attributeResult.success) return {success: false, reason: t.showError(attributeResult)}`,
        );
        output.push(
          `attributes[${JSON.stringify(a.name)}] = attributeResult.value`,
        );
        if (a.optional) {
          output.push(`}`);
        }
      }
    }
    if (body) {
      output.push(
        `const childrenResult = ${body.parseFnName}(element.elements)`,
      );
      output.push(
        `if (!childrenResult.success) return {success: false, reason: t.showError(childrenResult)}`,
      );
      output.push(
        `return {success: true, value: {attributes, children: childrenResult.value}} as any;`,
      );
    } else {
      output.push(
        `return {success: true, value: {attributes, children: undefined}} as any;`,
      );
    }
    output.push(`}`);

    //   `export function parse${typeName} = s.element('${elementName}'${
    //     attributes || elements
    //       ? `, {${[
    //           [`attributes`, attributes],
    //           [`elements`, elements],
    //         ]
    //           .filter((e) => e[1])
    //           .map(([k, v]) => `${k}: ${v}`)
    //           .join(`, `)}}`
    //       : ``
    //   })`,
    // );
  }
  const writtenElements = new Set<string>();
  const writeElement = (elementName: string, t: any): void => {
    if (writtenElements.has(elementName)) return;
    writtenElements.add(elementName);

    switch (t.name) {
      case 'element': {
        if (t.attributes.type) {
          const subType = types.get(
            t.attributes.type.startsWith(`${prefix}:`)
              ? t.attributes.type.substring(`${prefix}:`.length)
              : t.attributes.type,
          );
          if (!subType) {
            writeElementType(elementName, {
              attributes: [],
              body: getChildNodeType(t.attributes.type),
            });
          } else {
            writtenElements.delete(elementName);
            writeElement(elementName, subType);
          }
        } else {
          if (t.elements?.length !== 1) {
            console.log(t);
            throw new Error(`Invalid element`);
          }
          writtenElements.delete(elementName);
          writeElement(elementName, t.elements[0]);
        }
        break;
      }
      case 'complexType': {
        writeElementType(elementName, normalizeElements(t));
        break;
      }
      case 'simpleType': {
        if (
          t.elements.length !== 1 ||
          t.elements[0].name !== 'restriction' ||
          typeof t.elements[0].attributes.base !== 'string'
        ) {
          throw new Error(`Invalid type`);
        }

        writeElementType(elementName, {
          attributes: [],
          extensibleAttributes: false,
          body: getChildNodeType(t.elements[0].attributes.base),
        });
        break;
      }
      default:
        throw new Error(`Unsupported type ${t.name}`);
    }
  };

  for (const element of schema.elements) {
    if (element.type === 'element' && element.name === 'element') {
      writeElement(
        element.attributes.name.startsWith(`${prefix}:`)
          ? element.attributes.name
          : `${prefix}:${element.attributes.name}`,
        element,
      );
    }
  }

  output.push(``);
  writeFileSync(
    `${__dirname}/../src/elements/${prefix}.ts`,
    [...imports, ``, ...output].join('\n'),
  );

  function getChildNodeType(name: string, type?: any): Child {
    if (name.startsWith(`${prefix}:`)) {
      return getChildNodeType(name.substring(`${prefix}:`.length));
    }
    if (name.includes(`:`)) {
      // references another schema
      return getNames(name);
    }
    switch (name) {
      case 'string':
        return {
          typeName: `s.textNode`,
          parseFnName: `s.textNodeSchema.safeParse`,
          serializeFnName: `s.textNodeSchema.safeSerialize`,
        };
      case 'anyURI':
      case 'NCName':
      case 'integer':
      case 'base64Binary':
        const {type, schema} = getAttributeType(name);
        return {
          typeName: type,
          parseFnName: `s.textNodeSchemaOf(${schema}).safeParse`,
          serializeFnName: `s.textNodeSchemaOf(${schema}).safeSerialize`,
        };
      case 'anyType':
        return {
          typeName: `unknown`,
          parseFnName: `t.Unknown.safeParse`,
          serializeFnName: `t.Unknown.safeSerialize`,
        };
    }

    const t = type ?? types.get(name);
    if (!t) {
      throw new Error(`Cannot find type ${name}`);
    }

    switch (t.name) {
      case 'element': {
        writeElement(`${prefix}:${t.attributes.name}`, t);
        return getNames(t.attributes.name);
      }
      default:
        throw new Error(`Unsupported type ${t.name}`);
    }
  }
  function getAttributeType(name: string): {type: string; schema: string} {
    switch (name) {
      case 'string':
        return {type: `string`, schema: `t.String`};
      case 'anyURI':
      case 'base64Binary':
      case 'boolean':
      case 'dateTime':
      case 'ID':
      case 'integer':
      case 'NCName':
      case 'nonNegativeInteger':
      case 'unsignedShort':
        // TODO
        return {type: `s.${name}`, schema: `s.${name}Schema`};
      default:
        if (name.startsWith(`${prefix}:`)) {
          const n = name.substring(`${prefix}:`.length);
          return {type: n, schema: `${n}Schema`};
        }
        if (name.split(`:`).length === 2) {
          const [namespace, key] = name.split(`:`);
          addImport(namespace);
          const n = `${namespace}.${key}`;
          return {type: n, schema: `${n}Schema`};
        }
        throw new Error(`Unsupported attribute type: ${name}`);
    }
  }

  function normalizeElements(t: any): {
    attributes: Attribute[];
    extensibleAttributes: boolean;
    body?: Child;
  } {
    const attributes: Attribute[] = [];
    let extensibleAttributes = false;
    let body: Child | undefined;

    for (const element of t.elements ?? []) {
      pushElement(element);
    }

    return {attributes, extensibleAttributes, body};

    function pushElement(element: any) {
      if (element.type === 'comment') return;
      switch (element.name) {
        case 'attribute':
          pushAttribute(element);
          break;
        case 'anyAttribute':
          extensibleAttributes = true;
          break;
        case 'attributeGroup': {
          pushAttributeGroup(element);
          break;
        }
        case 'complexContent': {
          if (body) {
            console.log(t);
            throw new Error(
              `Body is specified multiple times in ${
                t.attributes.name ?? t.name
              }`,
            );
          }
          if (element.elements?.length !== 1) {
            console.log(element);
            throw new Error(`Invalid complexContent element`);
          }

          const content = element.elements[0];
          switch (content.name) {
            case 'extension': {
              const subtype = types.get(
                content.attributes.base.startsWith(`${prefix}:`)
                  ? content.attributes.base.substring(`${prefix}:`.length)
                  : content.attributes.base,
              );
              if (!subtype) {
                console.log(content);
                throw new Error(`Cannot find base type for extension`);
              }
              const base = normalizeElements(subtype);
              const ext = normalizeElements(content);
              if (base.body && ext.body) {
                body = {
                  typeName: `${base.body.typeName} & ${ext.body.typeName}`,
                  parseFnName: `s.sequenceParser(${base.body.parseFnName}, ${ext.body.serializeFnName})`,
                  serializeFnName: `s.sequenceSerializer(${base.body.parseFnName}, ${ext.body.serializeFnName})`,
                };
                // if (
                //   base.body.name !== 'sequence' ||
                //   ext.body.name !== 'sequence'
                // ) {
                //   console.error(
                //     `Body is specified multiple times in ${
                //       t.attributes.name ?? t.name
                //     }`,
                //     {base, ext},
                //   );
                //   body = ext.body;
                //   // throw new Error(
                //   //   `Body is specified multiple times in ${
                //   //     t.attributes.name ?? t.name
                //   //   }`,
                //   // );
                // } else {
                //   body = {
                //     type: 'element',
                //     name: 'sequence',
                //     elements: [...base.body.elements, ...ext.body.elements],
                //   };
                // }
              } else {
                body = ext.body ?? base.body;
              }
              attributes.push(...base.attributes);
              attributes.push(...ext.attributes);
              break;
            }
            case 'restriction': {
              if (content.attributes.base !== 'anyType') {
                console.log(content);
                throw new Error(`Unsupported restriction`);
              }
              const n = normalizeElements(content);
              attributes.push(...n.attributes);
              body = n.body;
              break;
            }
            default:
              console.log(content);
              throw new Error(`Invalid complexContent element`);
          }
          break;
        }
        case 'simpleContent':
          if (
            element.elements?.length !== 1 ||
            element.elements[0].name !== 'extension'
          ) {
            console.log(element);
            throw new Error(`Invalid simpleContent element`);
          }
          // TODO: Set body here
          body = getChildNodeType(element.elements[0].attributes.base);
          for (const e of element.elements[0].elements ?? []) {
            pushElement(e);
          }
          break;
        case 'choice':
          if (body) {
            console.log(t);
            throw new Error(
              `Body is specified multiple times in ${
                t.attributes.name ?? t.name
              }`,
            );
          }
          body = getChoiceChild(element);
          break;
        case 'sequence':
          if (body) {
            console.log(t);
            throw new Error(
              `Body is specified multiple times in ${
                t.attributes.name ?? t.name
              }`,
            );
          }
          body = getSequenceChild(element);
          break;
      }
    }

    function pushAttribute(element: any) {
      const {type, schema} = getAttributeType(element.attributes.type);

      attributes.push({
        name: element.attributes.name,
        type,
        schema,
        optional: element.attributes.use === 'optional',
      });
    }

    function pushAttributeGroup(element: any) {
      const group = types.get(
        element.attributes.ref.substring(`${prefix}:`.length),
      );
      if (!group) {
        throw new Error(
          `Unable to find attribute group: ${JSON.stringify(element)}`,
        );
      }
      for (const element of group.elements ?? []) {
        pushElement(element);
      }
    }
  }

  function getChild(body: any): Child {
    switch (body.name) {
      case 'choice':
        return getChoiceChild(body);
      case 'sequence':
        return getSequenceChild(body);
      case 'element':
        const name = body.attributes.ref ?? body.attributes.name;
        return getChildNodeType(name, body.attributes.ref ? undefined : body);
      // const name = element.attributes.ref ?? element.attributes.name;
      // if (element.attributes.ref) {
      //   return {name, type: outputNodeType(element.attributes.ref)};
      // } else {
      //   return {
      //     name,
      //     type: outputNodeType(`${element.attributes.name}`, element),
      //   };
      // }
      case 'any':
        return {
          typeName: `unknown`,
          parseFnName: `parseUnknown`,
          serializeFnName: `serializeUnknown`,
        };
      // return {
      //   name: `extensions`,
      //   type: `s.unknownElement('${prefix}', '${element.attributes.namespace}')`,
      // };
      default:
        console.log(body);
        throw new Error(`Unsupported body type: ${body.name}`);
    }
  }
  function getChoiceChild(body: any): Child {
    const elements = (body.elements as any[])
      .filter((e) => e.type !== 'comment')
      .map((e) => getChild(e));
    return {
      typeName: elements.map((e) => e.typeName).join(` | `),
      parseFnName: `s.choiceParser(${elements
        .map((e) => e.parseFnName)
        .join(`, `)})`,
      serializeFnName: `s.choiceSerializer(${elements
        .map((e) => e.serializeFnName)
        .join(`, `)})`,
    };
  }
  function getSequenceChild(body: any): Child {
    const elements = (body.elements as any[])
      .filter((e) => e.type !== 'comment')
      .map((e) => getChild(e));
    return {
      typeName: elements.map((e) => e.typeName).join(` | `),
      parseFnName: `s.sequenceParser(${elements
        .map((e) => e.parseFnName)
        .join(`, `)})`,
      serializeFnName: `s.sequenceParser(${elements
        .map((e) => e.serializeFnName)
        .join(`, `)})`,
    };
  }

  // let elements: string | undefined;

  // function getElementsType(element: any): {name: string; type: string} {
  //   switch (element.name) {
  //     case 'choice': {
  //       const elements = (element.elements as any[])
  //         .filter((e) => e.type !== 'comment')
  //         .map((e) => wrapElementType(e));
  //       return {
  //         name: elements.map((e) => e.name).join(`_`),
  //         type: `s.choice(${elements.map((e) => e.type).join(`, `)})`,
  //       };
  //     }
  //     case 'sequence':
  //       const s = [`s.sequence()`];
  //       const n = [];
  //       for (const e of element.elements) {
  //         if (e.type !== 'comment') {
  //           const {name, type} = wrapElementType(e);
  //           n.push(name);
  //           s.push(`pushNamed('${name}', ${type})`);
  //         }
  //       }
  //       return {name: n.join(`_`), type: s.join(`.`)};
  //     case 'element':
  //       const name = element.attributes.ref ?? element.attributes.name;
  //       if (element.attributes.ref) {
  //         return {name, type: outputNodeType(element.attributes.ref)};
  //       } else {
  //         return {
  //           name,
  //           type: outputNodeType(`${element.attributes.name}`, element),
  //         };
  //       }
  //     case 'any':
  //       return {
  //         name: `extensions`,
  //         type: `s.unknownElement('${prefix}', '${element.attributes.namespace}')`,
  //       };
  //     default:
  //       console.log(element);
  //       throw new Error(`Unsupported element type: ${element.name}`);
  //   }
  // }
  // function wrapElementType(element: any): {name: string; type: string} {
  //   const isRequired = element.attributes?.minOccurs !== '0';
  //   const isList = element.attributes?.maxOccurs === 'unbounded';
  //   let {name, type} = getElementsType(element);
  //   if (!isRequired) {
  //     type = `s.optionalElement(${type})`;
  //   }
  //   if (isList) {
  //     type = `s.repeatedElement(${type})`;
  //   }
  //   return {name, type: type};
  // }

  // for (const element of normalizedElements) {
  //   if (element.type === 'comment') continue;
  //   switch (element.name) {
  //     case 'simpleContent':
  //       onBody();
  //       if (
  //         element.elements?.length !== 1 ||
  //         element.elements[0].name !== 'extension'
  //       ) {
  //         console.log(element);
  //         throw new Error(`Invalid simpleContent element`);
  //       }
  //       elements = outputNodeType(element.elements[0].attributes.base);
  //       for (const e of element.elements[0].elements ?? []) {
  //         pushAttribute(e);
  //       }
  //       break;

  //     case 'choice':
  //     case 'sequence': {
  //       onBody();
  //       elements = `${wrapElementType(element).type}.end()`;
  //       break;
  //     }
  //     default:
  //       console.log(element);
  //       throw new Error(`Unsupported element: ${element.name}`);
  //   }
  // }
}

handle(`xenc`, `xenc-schema.xsd`);
handle(`ds`, `xmldsig-core-schema.xsd`);
handle(`samlp`, `saml-schema-protocol-2.0.xsd`);
handle(`saml`, `saml-schema-assertion-2.0.xsd`);

spawnSync(
  `yarn`,
  [`prettier`, `--write`, `packages/saml-protocol/src/elements/*.ts`],
  {cwd: `${__dirname}/../../..`, stdio: `inherit`},
);
