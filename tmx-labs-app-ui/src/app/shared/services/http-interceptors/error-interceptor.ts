import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { HttpErrorInterceptorService } from './http-error-interceptor.service';

export const SKIP_ERROR_HANDLING = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip error handling if context token is set
  if (req.context.get(SKIP_ERROR_HANDLING)) {
    return next(req);
  }

  const httpErrorInterceptorService = inject(HttpErrorInterceptorService);

  return next(req).pipe(
    catchError((response: HttpErrorResponse) => httpErrorInterceptorService.handle(response))
  );
};
