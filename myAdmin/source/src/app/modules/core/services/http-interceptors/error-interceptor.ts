import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";

import { Injectable } from "@angular/core";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";

@Injectable()
export class HttpInterceptorErrorService implements HttpInterceptor {

	constructor(
		public router: Router,
		private loadingService: LoadingService,
		private notificationService: NotificationService) { }

	intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		return next.handle(req).pipe(
			catchError((response) => {
				const handled = false;
				if (response instanceof HttpErrorResponse) {
					if (response.error instanceof ErrorEvent) { }
					else {
						let message = "";
						let errorCode = "?";
						switch (response.status) {
							case 400:
								message = `${(response.error[0].message)}`;
								errorCode = response.error[0].severityCode;
								this.notificationService.error(
									`Sorry, your transaction could not be processed.\n\nMessage: ${message}`);
								break;
							case 401:
								this.redirect("unauthorized");
								break;
							case 403:
								this.redirect("forbidden");
								break;
							case 408:
								this.notificationService.error("Your transaction has timed out, please try again.");
								break;
							case 500:
							default:
								if (response.error?.developerMessage) {
									message = `${response.error.developerMessage}`;
									errorCode = response.error.errorCode;
								}
								else if (response.error?.Messages) {
									message = (response.error.Messages.Handled || !response.error.Messages.ErrorDetails) ? response.error.Messages.Error : response.error.Messages.ErrorDetails;
								}
								else if (response.statusText) {
									message = response.statusText;
								}
								this.notificationService.error(
									`Sorry, your transaction could not be processed.\nIf the issue persists please contact SM.` +
									`\n\nMessage: ${message}`);
								break;
						}
					}
				}

				this.loadingService.stopLoading();
				if (handled) {
					return of(response);
				}
				else {
					return throwError(response);
				}
			})
		);
	}

	redirect(url: string): void {
		this.router.navigateByUrl("/" + url);
		this.loadingService.stopLoading();
	}
}
