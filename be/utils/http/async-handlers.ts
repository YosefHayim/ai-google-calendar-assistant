import type { NextFunction, Request, Response } from "express";

/**
 * Express async middleware wrapper
 *
 * Wraps an async Express middleware to properly catch and forward errors
 * to the Express error handler via next().
 *
 * @param fn - Async Express middleware function.
 * @returns Express middleware that catches async errors.
 */
export const reqResAsyncHandler =
  <
    H extends (
      req: Request,
      res: Response,
      next: NextFunction
    ) => Promise<unknown>,
  >(
    fn: H
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

/**
 * Promise wrapper for functions
 *
 * Ensures a function always returns a Promise, whether it's sync or async.
 * Useful for consistent error handling and chaining.
 *
 * @param fn - Function to wrap.
 * @returns Wrapped function that always returns a Promise.
 */
export const asyncHandler =
  <A extends unknown[], R>(fn: (...args: A) => R | Promise<R>) =>
  (...args: A): Promise<R> =>
    Promise.resolve(fn(...args));
