// async-handlers.ts
import type { NextFunction, Request, Response } from "express";

/**
 * Request and response async handler
 *
 * @param {H} fn - The function to handle the request and response.
 * @returns {Promise<unknown>} The result of the function.
 * @description Handles a request and response and sends the response.
 * @example
 * const data = await reqResAsyncHandler(fn);
 * console.log(data);
 */
export const reqResAsyncHandler =
  <H extends (req: Request, res: Response, next: NextFunction) => Promise<unknown>>(fn: H) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };

/**
 * Async handler
 *
 * @param {(...args: unknown[]) => unknown | Promise<unknown> } fn - The function to handle the request and response.
 * @returns {Promise<unknown>} The result of the function.
 * @description Handles an async function and sends the response.
 */
export const asyncHandler =
  <A extends unknown[], R>(fn: (...args: A) => R | Promise<R>) =>
  (...args: A): Promise<R> =>
    Promise.resolve(fn(...args)).catch((err) => {
      throw err;
    });
