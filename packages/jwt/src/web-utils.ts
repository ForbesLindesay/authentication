export function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}
export function strToUrlBase64(str: string) {
  return binaryStringToUrlBase64(toBinaryString(str));
}

export function uint8ToUrlBase64(uint8: Uint8Array) {
  var bin = '';
  uint8.forEach(function (code) {
    bin += String.fromCharCode(code);
  });
  return binaryStringToUrlBase64(bin);
}
export function urlBase64ToUint8(str: string) {
  var bin = urlBase64ToBinaryString(str);
  const result = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    result[i] = bin.charCodeAt(i);
  }
  return result;
}

export function urlBase64ToString(str: string) {
  return fromBinaryString(urlBase64ToBinaryString(str));
}

function urlBase64ToBinaryString(str: string) {
  return atob(str.replace(/\-/g, '+').replace(/_/g, '/'));
}

function binaryStringToUrlBase64(bin: string) {
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+/g, '');
}

function toBinaryString(string: string) {
  const codeUnits = new Uint16Array(string.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = string.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}
function fromBinaryString(bin: string) {
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint16Array(bytes.buffer));
}
