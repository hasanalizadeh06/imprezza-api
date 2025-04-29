import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';
import { ValidationError } from 'class-validator';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | object = 'Internal server error';

    // Handle specific known exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse();
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      message = {
        error: 'Database Error',
        message: 'Database operation failed',
        detail: exception.message,
      };
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = {
        error: 'Not Found',
        message: 'The requested resource was not found',
        detail: exception.message,
      };
    } else if (
      exception instanceof Array &&
      exception[0] instanceof ValidationError
    ) {
      status = HttpStatus.BAD_REQUEST;
      const validationErrors = exception as ValidationError[];
      message = {
        error: 'Validation Error',
        message: 'Validation failed',
        errors: this.formatValidationErrors(validationErrors),
      };
    } else if (exception instanceof Error) {
      message = {
        error: exception.name,
        message: exception.message,
      };
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(typeof message === 'object' ? message : { message }),
    });
  }

  private formatValidationErrors(
    errors: ValidationError[],
  ): Record<string, string[]> {
    return errors.reduce((acc, error) => {
      acc[error.property] = Object.values(error.constraints || {});
      return acc;
    }, {});
  }
}
