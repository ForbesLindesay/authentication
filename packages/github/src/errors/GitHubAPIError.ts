import BaseError from '@authentication/base-error';

export default class GitHubAPIError extends BaseError {
  constructor(message: string, statusCode: number) {
    super('GITHUB_API_ERROR', message, statusCode);
  }
}
