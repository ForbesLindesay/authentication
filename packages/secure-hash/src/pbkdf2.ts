// @public

import SecureHashAPI from './api';
import Pbkdf2Implemenation from './implementations/Pbkdf2Implemenation';
import {Pbkdf2Options} from './implementations/SecureHashImplementation';
import fallbacks from './fallbacks';

const defaultImplementaiton = new Pbkdf2Implemenation();
const defaultAPI = new SecureHashAPI(defaultImplementaiton);

fallbacks.push(defaultImplementaiton);

export {Pbkdf2Options};

export const pbkdf2 = defaultImplementaiton.algorithm;
export function setConfig(options: Pbkdf2Options) {
  defaultAPI.setDefaultImplementation(defaultImplementaiton, options);
}
export const hash = defaultAPI.hash.bind(defaultAPI);
export const verify = defaultAPI.verify.bind(defaultAPI);

export default class Pbkdf2 extends SecureHashAPI {
  constructor(options?: Pbkdf2Options) {
    super(new Pbkdf2Implemenation(options), options);
  }

  static hash = hash;
  static verify = verify;
}

module.exports = Pbkdf2;
module.exports.default = Pbkdf2;
