import {Request, Response, NextFunction} from 'express';
import Mixed from './Mixed';
import Profile from './Profile';

export default interface RedirectStrategy<
  State = Mixed,
  InitOptions = {},
  CallbackOptions = {}
> {
  readonly callbackPath: string;

  /**
   * Is the request a callback request
   */
  isCallbackRequest(req: Request): boolean;

  /**
   * Return's true if the user clicked "Cancel"
   */
  userCancelledLogin(req: Request): boolean;

  /**
   * Send the user to the provider so they can approve the login
   * request.
   */
  redirectToProvider(
    req: Request,
    res: Response,
    next: NextFunction,
    options?: InitOptions & {state?: State},
  ): void;

  /**
   * Complete the login request. Loads the normalized profile.
   */
  completeAuthentication(
    req: Request,
    res: Response,
    options?: CallbackOptions,
  ): Promise<{
    profile: Profile;
    state?: State;
  }>;
};
