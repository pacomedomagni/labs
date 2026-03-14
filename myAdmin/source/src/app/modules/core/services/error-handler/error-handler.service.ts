import { ErrorHandler, Injectable } from "@angular/core";
import { ClientError } from "@modules/core/types/client-error";
import { HttpErrorResponse } from "@angular/common/http";
import { ApiService } from "../api/api.service";

@Injectable()
export class ErrorHandlerService implements ErrorHandler {

	constructor(private api: ApiService) { }

	handleError(error: Error | HttpErrorResponse): void {
		this.logError(error);
	}

	public logError<T>(error: any, detail?: any): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.postError(resolve, error, detail);
		});
	}

	private postError<T>(resolve: any, error: any, detail?: any): void {

		if (error.name !== "HttpErrorResponse") {
			const errorObject: ClientError = {
				Message: error.message ? error.message : error.toString(),
				StackTrace: error.stack,
				Detail: detail
			};

			/* this.api.post<any>({
				uri: `/clientErrorLogger`,
				payload: errorObject
			}).subscribe(() => { resolve(); }, () => { resolve(); }); */
		}

		console.error("🚀 ~ Error Handler Service ~ ", error);
	}
}
