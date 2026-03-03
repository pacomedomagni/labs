import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Observable, of, throwError, timer } from "rxjs";
import { catchError, map, mergeMap, retryWhen, take, timeout, withLatestFrom } from "rxjs/operators";

import { Injectable } from "@angular/core";
import { OAuthStorage } from "angular-oauth2-oidc";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { CookieService } from "ngx-cookie-service";
import { LoadingService } from "../loading/loading.service";
import { ConfigurationSettings } from "../configuration/config-info";
import { DistributedTracingService } from "../api/distributedTracing.service";

export type ApiOptions = {
	responseType?: "json" | "text" | "blob";
	timeout?: number;
	retries?: number;
	retryDelay?: number;
	async?: boolean;
	fullResponse?: boolean;
};

export interface ApiRequestConfig {
	uri: string;
	payload?: any;
	headers$?: Observable<HttpHeaders>;
	options?: Partial<ApiOptions>;
}

@Injectable({ providedIn: "root" })
export class ApiService {

	private static sessionGuid;
	private defaultApiOptions: ApiOptions = { timeout: 15000 };

	static genericRetryStrategy = ({
		maxRetryAttempts = 0,
		retryDelay = 1000,
		includedStatusCodes = [0]
	}: {
		maxRetryAttempts?: number;
		retryDelay?: number;
		includedStatusCodes?: number[];
	} = {}) => (attempts: Observable<any>) => attempts.pipe(
		mergeMap((error, i) => {
			const retryAttempt = i + 1;
			if (retryAttempt > maxRetryAttempts || includedStatusCodes.filter(e => e === error.status).length === 0) {
				return throwError(error);
			}
			return timer(retryDelay);
		})
	);

	private static generateGuid(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			/* eslint-disable no-bitwise */
			const r = Math.random() * 16 | 0;
			const v = c === "x" ? r : (r & 0x3 | 0x8);
			/* eslint-enable no-bitwise */
			return v.toString(16);
		});
	}

	constructor(
		private httpClient: HttpClient,
		private authStorage: OAuthStorage,
		private loadingService: LoadingService,
		private cookieService: CookieService,
		private notificationService: NotificationService,
		private distributedTracingService: DistributedTracingService) {
			ApiService.sessionGuid = ApiService.generateGuid();
		}

	get<T extends any>({ uri, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("GET", of(this.getUrl(uri)), undefined, headers$, options);
	}

	getAsync<T extends any>({ uri, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options, ...{ async: true } };
		return this.get<T>({ uri, headers$, options });
	}

	post<T extends any>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("POST", of(this.getUrl(uri)), payload, headers$, options);
	}

	postAsync<T extends any>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options, ...{ async: true } };
		return this.request<T>("POST", of(this.getUrl(uri)), payload, headers$, options);
	}

	patch<T extends any>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("PATCH", of(this.getUrl(uri)), payload, headers$, options);
	}

	delete<T extends any>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request("DELETE", of(this.getUrl(uri)), payload, headers$, options);
	}

	put<T extends any>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("PUT", of(this.getUrl(uri)), payload, headers$, options);
	}

	private getUrl(uri: string): string {
		return ConfigurationSettings.appSettings.connections.apiUrl + this.slottedUrl(uri);
	}

	private slottedUrl(uri: string): string {
		const operator = uri.indexOf("?") === -1 ? "?" : "&";
		const slot = ConfigurationSettings.appSettings.connections.slot;
		return slot !== undefined ? `${uri}${operator}=${slot}` : uri;
	}

	private request<T extends any>(
		method: string,
		url$: Observable<string>,
		payload: any,
		headers$: Observable<HttpHeaders>,
		options: Partial<ApiOptions>
	): Observable<any> {

		const traceId = ApiService.sessionGuid;
		const request$ = this.buildRequest(url$, payload, method, headers$, options, traceId);
		const result$ = request$.pipe(
			withLatestFrom(of(options.timeout)),
			take(1),
			mergeMap(([request, timeoutValue]) => {
				const httpTimeout = options.timeout || timeoutValue;
				const responseType = options.responseType || "json";
				const observe: "response" = "response";
				const reportProgress = options.async ?? false;
				const requestOptions = {
					body: request.body,
					headers: request.headers,
					observe,
					reportProgress,
					responseType
				};
				return this.httpClient.request(request.method, request.url, requestOptions).pipe(
					timeout(httpTimeout),
					retryWhen(ApiService.genericRetryStrategy({ maxRetryAttempts: options.retries, retryDelay: options.retryDelay })),
					catchError((error: Error | HttpErrorResponse) => {
						if (error instanceof Error) {
							switch (error.name) {
								case "TimeoutError":
									error = { status: 408 } as HttpErrorResponse;
									break;
							}
							this.notificationService.error("Your transaction has timed out, please try again.");
							this.loadingService.stopLoading();
						}

						const returnError = {
							...error,
							message: `${request.method} ${request.url} : ${error.message}`,
							traceId: `${request.headers.get("x-tmxtrace-traceid")}`,
							user: `${request.headers.get("x-tmxtrace-tmxuser")}`
						};

						throw returnError;

					})
				);
			})
		);

		return result$.pipe(map(response => options.fullResponse ? response : response.body as T));
	}

	private buildRequest<T extends any>(
		url$: Observable<string>,
		payload: any,
		method: string,
		headers$: Observable<HttpHeaders>,
		options: ApiOptions,
		traceId: string
	): Observable<HttpRequest<T>> {
		headers$ = headers$ || of(new HttpHeaders({
			"Content-Type": "application/json",
			Authorization: `Bearer ${this.authStorage.getItem("access_token")}`
		}));
		return url$.pipe(mergeMap(requestPath => this.buildRequestOptions<T>(requestPath, payload, method, headers$, options, traceId)));
	}

	private buildRequestOptions<T extends any>(
		path: string,
		payload: any,
		method: string,
		headers$: Observable<HttpHeaders>,
		options: ApiOptions,
		traceId: string
	): Observable<HttpRequest<T>> {
		return headers$.pipe(
			map(headers => ({
				method,
				headers: this.addHeaders(headers, options, traceId),
				url: path
			})),
			map(this.addPayload(payload))
		);
	}

	private addHeaders(headers: HttpHeaders, options: ApiOptions, traceId: string): HttpHeaders {
		const span = this.distributedTracingService?.spanContext;
		if (headers && span) {
			const spanVal = `traceparent;desc="00-${span.traceId}-${span.spanId}-01"`;
			headers = headers
				.append("Server-Timing", spanVal)
				.append("Access-Control-Expose-Headers", "Server-Timing");
		}
		if (headers) {
			headers = headers
				.append("Cache-Control", "no-cache")
				.append("Pragma", "no-cache")
				.append("Expires", "0")
				.append("x-tmxclient", "TMX Admin App")
				.append("x-tmxtrace-tmxuser", this.cookieService.get("tmxuser"))
				.append("x-tmxtrace-traceid", traceId)
				;
		}
		return headers;
	}

	private addPayload(payload: any): any {
		return (request: any) => {
			if (payload) {
				return {
					...request,
					body: JSON.stringify(payload)
				};
			}
			return request;
		};
	}
}
