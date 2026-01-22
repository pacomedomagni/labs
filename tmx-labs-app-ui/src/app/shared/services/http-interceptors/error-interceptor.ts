import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs';
import { HttpErrorInterceptorService } from './http-error-interceptor.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const httpErrorInterceptorService = inject(HttpErrorInterceptorService);

  return next(req).pipe(
    catchError((response: HttpErrorResponse) => httpErrorInterceptorService.handle(response))
  );
};
