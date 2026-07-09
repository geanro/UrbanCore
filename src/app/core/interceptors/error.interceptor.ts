import { HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { ErrorResponse } from '../models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(catchError(error => {
    const body = error.error as ErrorResponse | undefined;
    const message = body?.message || body?.errors && Object.values(body.errors).join('\n') || error.message || 'Error inesperado';
    return throwError(() => new Error(message));
  }));
};
