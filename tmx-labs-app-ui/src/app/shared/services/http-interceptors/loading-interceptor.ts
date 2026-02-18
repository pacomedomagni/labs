import { HttpContextToken, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../infrastructure/loading/loading.service';

export const SKIP_LOADING = new HttpContextToken<boolean>(() => false);

let totalRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  
  // Skip loading indicator if context token is set
  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }
  
  totalRequests++;

  setTimeout(() => {
    if (!req.reportProgress && totalRequests > 0) {
      loadingService.startLoading();
    }
  });

  return next(req).pipe(
    finalize(() => {
      totalRequests--;
      if (totalRequests === 0) {
        loadingService.stopLoading();
      }
    })
  );
};
