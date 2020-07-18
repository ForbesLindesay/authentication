export function strToUint8(str: string) {
  return new TextEncoder().encode(str);
}
export function strToUrlBase64(str: string) {
  return binToUrlBase64(utf8ToBinaryString(str));
}

export function uint8ToUrlBase64(uint8: Uint8Array) {
  var bin = '';
  uint8.forEach(function(code) {
    bin += String.fromCharCode(code);
  });
  return binToUrlBase64(bin);
}

function binToUrlBase64(bin: string) {
  return btoa(bin)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+/g, '');
}
function utf8ToBinaryString(str: string) {
  var escstr = encodeURIComponent(str);
  // replaces any uri escape sequence, such as %0A,
  // with binary escape, such as 0x0A
  var binstr = escstr.replace(/%([0-9A-F]{2})/g, function(match, p1) {
    return String.fromCharCode(parseInt(p1, 16));
  });

  return binstr;
}
