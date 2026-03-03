import {
	HttpHandler,
	HttpInterceptor,
	HttpRequest
} from "@angular/common/http";

import { Injectable } from "@angular/core";
import { finalize } from "rxjs/operators";
import { LoadingService } from "../loading/loading.service";

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
	private totalRequests = 0;

	constructor(private loadingService: LoadingService) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): any {
		this.totalRequests++;

		setTimeout(() => {
			if (!request.reportProgress && this.totalRequests > 0) {
				this.loadingService.startLoading();
			}
		});

		return next.handle(request).pipe(
			finalize(() => {
				this.totalRequests--;
				if (this.totalRequests === 0) {
					this.loadingService.stopLoading();
				}
			})
		);
	}
}
