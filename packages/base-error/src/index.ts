export default class BaseError extends Error {
  readonly code: string;
  readonly statusCode?: number;
  constructor(code: string, message: string, statusCode?: number) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
    this.code = code;
    this.statusCode = statusCode;
  }
}
