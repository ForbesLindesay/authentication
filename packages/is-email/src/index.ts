// code copied from https://github.com/scottgonzalez/sane-email-validation/blob/master/index.js
// and converted to typescript

const localAddr = /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+$/i;
const domain = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

export function isEmail(str: string): boolean {
  if (typeof str !== 'string') {
    return false;
  }
  var parts = str.split('@');
  if (parts.length !== 2) {
    return false;
  }

  if (!localAddr.test(parts[0])) {
    return false;
  }

  if (!domain.test(parts[1])) {
    return false;
  }

  return true;
}
export function isNotEmail(str: string): boolean {
  return !isEmail(str);
}
export default isEmail;

module.exports = isEmail;
module.exports.default = isEmail;
module.exports.isEmail = isEmail;
module.exports.isNotEmail = isNotEmail;
