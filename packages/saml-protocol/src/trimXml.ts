const {DOMParser, XMLSerializer} = require('@auth0/xmldom');

const whitespace = /^\s+$/;

function removeEmptyNodes(node: Node) {
  for (var i = 0; i < node.childNodes.length; i++) {
    const current = node.childNodes[i];
    if (
      current.nodeType === 3 &&
      (!current.nodeValue || whitespace.test(current.nodeValue))
    ) {
      node.removeChild(current);
    } else if (current.nodeType === 1) {
      removeEmptyNodes(current); //remove whitespace on child element's children
    }
  }
}

export default function trimXML(xml: string) {
  var dom = new DOMParser().parseFromString(xml);
  var serializer = new XMLSerializer();
  removeEmptyNodes(dom);
  return serializer.serializeToString(dom);
}
