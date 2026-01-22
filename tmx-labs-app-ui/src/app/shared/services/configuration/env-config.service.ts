import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";

import { Injectable, inject } from "@angular/core";
import { catchError } from "rxjs/operators";
import { EnvConfig } from "./config-info";

@Injectable({ providedIn: "root", })
export class EnvConfigService {
	private fileUrl = "../envConfig/env.config.json";

	private httpClient = inject(HttpClient);

	getEnvConfig(): Observable<HttpResponse<EnvConfig>> {
		return this.httpClient.get<EnvConfig>(this.fileUrl, { observe: "response" }).pipe(
			catchError(this.handleError)
		);
	}

	private handleError(err: HttpErrorResponse): Observable<never> {
		let errorMessage = "";

		if (err.error instanceof ErrorEvent) {
			errorMessage = `An error occurred: ${err.error.message}`;
		} else {
			errorMessage = `Server returned code: ${err.status}, error message is ${err.message}`;
		}

		console.error(errorMessage);
		return throwError(() => new Error(errorMessage));
	}
}
