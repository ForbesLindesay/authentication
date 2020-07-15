// @public

import SecureHashAPI from './api';
import Argon2idImplemenation from './implementations/Argon2idImplemenation';
import {Argon2idOptions} from './implementations/SecureHashImplementation';
import fallbacks from './fallbacks';

const defaultImplementaiton = new Argon2idImplemenation();
const defaultAPI = new SecureHashAPI(defaultImplementaiton);

fallbacks.push(defaultImplementaiton);

export {Argon2idOptions};

export const argon2id = defaultImplementaiton.algorithm;
export function setConfig(options: Argon2idOptions) {
  defaultAPI.setDefaultImplementation(defaultImplementaiton, options);
}
export const hash = defaultAPI.hash.bind(defaultAPI);
export const verify = defaultAPI.verify.bind(defaultAPI);

export default class Argon2id extends SecureHashAPI {
  constructor(options?: Argon2idOptions) {
    super(new Argon2idImplemenation(options), options);
  }

  static hash = hash;
  static verify = verify;
}

module.exports = Argon2id;
module.exports.default = Argon2id;
