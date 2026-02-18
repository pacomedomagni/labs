import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { EMPTY, Observable, throwError } from 'rxjs';
import { LoadingService } from '../infrastructure/loading/loading.service';
import { NotificationBannerService } from '../../notifications/notification-banner/notification-banner.service';

@Injectable({ providedIn: 'root' })
export class HttpErrorInterceptorService {
  constructor(
    private readonly router: Router,
    private readonly loadingService: LoadingService,
    private readonly notificationBannerService: NotificationBannerService
  ) {}

  handle(response: HttpErrorResponse): Observable<HttpEvent<unknown>> {
    if (response.error instanceof ErrorEvent) {
      console.error('Client-side error:', response.error.message);
    } else {
      this.processServerError(response);
    }

    this.loadingService.stopLoading();

    if (this.isHandled(response)) {
      return EMPTY;
    }

    return throwError(() => response) as Observable<HttpEvent<unknown>>;
  }

  private processServerError(response: HttpErrorResponse) {
    switch (response.status) {
      case 400:
        this.notificationBannerService.error(
          `Sorry, your transaction could not be processed.<br>Message: ${this.getErrorMessage(response, 'Bad Request.')}`
        );
        break;
      case 401:
        void this.redirect('unauthorized');
        break;
      case 403:
        void this.redirect('forbidden');
        break;
      case 404:
        // Do nothing, let other parts of the app handle 404s as needed
        break;
      case 408:
        this.notificationBannerService.error('Your transaction has timed out, please try again.');
        break;
      case 500:
      default:
        this.notificationBannerService.error(
          'Sorry, your transaction could not be processed. If the issue persists please contact SM.' +
            `<br>Message: ${this.getErrorMessage(response, 'An unexpected error occurred on the server.')}`
        );
        break;
    }
  }

  private getErrorMessage(response: HttpErrorResponse, fallback: string): string {
    if (response.error?.developerMessage) {
      return `${response.error.developerMessage}`;
    }

    if (response.error?.messages) {
      if (response.error.messages.StatusDescription === 'InternalServerError') {
        return response.error.messages.Error;
      }

      return response.error.messages.ErrorCode || response.error.messages.Error || fallback;
    }

    if (response.statusText) {
      return response.statusText;
    }

    if (response.message) {
      return response.message;
    }

    return fallback;
  }

  private isHandled(response: HttpErrorResponse): boolean {
    return !!response.error?.Messages?.Handled;
  }

  private async redirect(url: string) {
    try {
      await this.router.navigateByUrl(`/${url}`);
    } catch (error) {
      console.error('Navigation failed:', error);
    } finally {
      this.loadingService.stopLoading();
    }
  }
}
