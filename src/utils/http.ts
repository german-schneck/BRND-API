// Dependencies
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

/**
 * Sends a JSON response with a status of 200 (OK) including the provided data and action.
 *
 * @param res - The Express response object.
 * @param action - A string describing the action performed.
 * @param data - The data to be included in the response.
 * @returns The response object with the status set to 200 and the provided data and action in JSON format.
 */
export const hasResponse = <T>(res: Response, action: string, data: T) =>
  res.status(HttpStatus.OK).json({
    data,
    action,
  });

/**
 * Sends a JSON response with the specified status including the provided data and action.
 *
 * @param res - The Express response object.
 * @param status - The HTTP status code to be set in the response. Defaults to 500 (Internal Server Error).
 * @param action - A string describing the action performed.
 * @param data - The data to be included in the response.
 * @returns The response object with the specified status and the provided data and action in JSON format.
 */
export const hasError = <T>(
  res: Response,
  status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  action: string,
  data: T,
) =>
  res.status(status).json({
    data,
    action,
  });

export { HttpStatus };
