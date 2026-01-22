import { HttpClient, HttpErrorResponse, HttpHeaders, HttpRequest } from "@angular/common/http";
import { Observable, of, throwError, timer } from "rxjs";
import { catchError, map, mergeMap, retry, take, timeout, withLatestFrom } from "rxjs/operators";

import { inject, Injectable } from "@angular/core";
import { OAuthStorage } from "angular-oauth2-oidc";
import { CookieService } from "ngx-cookie-service";
import { LoadingService } from "../infrastructure/loading/loading.service";
import { ConfigurationSettings } from "../configuration/config-info";
import { NotificationBannerService } from "../../notifications/notification-banner/notification-banner.service";

export interface ApiOptions {
	responseType?: "json" | "text" | "blob";
	timeout?: number;
	retries?: number;
	retryDelay?: number;
	async?: boolean;
	fullResponse?: boolean;
};

export interface ApiRequestConfig {
	uri: string;
	payload?: unknown;
	headers$?: Observable<HttpHeaders>;
	options?: Partial<ApiOptions>;
}

@Injectable({ providedIn: "root" })
export class ApiService {
	private httpClient = inject(HttpClient);
	private authStorage = inject(OAuthStorage);
	private loadingService = inject(LoadingService);
	private cookieService = inject(CookieService)
	private notificationService = inject(NotificationBannerService);

	private static sessionGuid: string;
	private defaultApiOptions: ApiOptions = { timeout: 15000 };

	static genericRetryStrategy = ({
		maxRetryAttempts = 0,
		retryDelay = 1000,
		includedStatusCodes = [0]
	}: {
		maxRetryAttempts?: number;
		retryDelay?: number;
		includedStatusCodes?: number[];
	} = {}) => (attempts: Observable<HttpErrorResponse>) => attempts.pipe(
		mergeMap((error, i) => {
			const retryAttempt = i + 1;
			if (retryAttempt > maxRetryAttempts || includedStatusCodes.filter(e => e === error.status).length === 0) {
				return throwError(() => error);
			}
			return timer(retryDelay);
		})
	);

	private static generateGuid(): string {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
			const r = Math.random() * 16 | 0;
			const v = c === "x" ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	constructor() {
			ApiService.sessionGuid = ApiService.generateGuid();
		}

	get<T>({ uri, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("GET", of(this.getUrl(uri)), undefined, headers$, options);
	}

	getAsync<T>({ uri, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options, ...{ async: true } };
		return this.get<T>({ uri, headers$, options });
	}

	post<T>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("POST", of(this.getUrl(uri)), payload, headers$, options);
	}

	postAsync<T>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options, ...{ async: true } };
		return this.request<T>("POST", of(this.getUrl(uri)), payload, headers$, options);
	}

	patch<T>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request<T>("PATCH", of(this.getUrl(uri)), payload, headers$, options);
	}

	delete<T>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
		options = { ...this.defaultApiOptions, ...options };
		return this.request("DELETE", of(this.getUrl(uri)), payload, headers$, options);
	}

	put<T>({ uri, payload, headers$, options }: ApiRequestConfig): Observable<T> {
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

	private request<T>(
		method: string,
		url$: Observable<string>,
		payload: unknown,
		headers$: Observable<HttpHeaders>,
		options: Partial<ApiOptions>
	): Observable<T> {

		const traceId = ApiService.sessionGuid;
		const request$ = this.buildRequest(url$, payload, method, headers$, options, traceId);
		const result$ = request$.pipe(
			withLatestFrom(of(options.timeout)),
			take(1),
			mergeMap(([request, timeoutValue]) => {
				const httpTimeout = options.timeout || timeoutValue;
				const responseType = options.responseType || "json";
				const observe = "response" as const;
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
					retry({count: options.retries ?? 0, delay: options.retryDelay}),
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

	private buildRequest<T>(
		url$: Observable<string>,
		payload: unknown,
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

	private buildRequestOptions<T>(
		path: string,
		payload: unknown,
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
		if (headers) {
			headers = headers
				.append("Cache-Control", "no-cache")
				.append("Pragma", "no-cache")
				.append("Expires", "0")
				.append("x-tmxclient", "TMX Labs App")
				.append("x-tmxtrace-tmxuser", this.cookieService.get("tmxuser"))
				.append("x-tmxtrace-traceid", traceId);
		}
		return headers;
	}

	private addPayload<T>(payload: unknown): (request: { method: string; headers: HttpHeaders; url: string }) => HttpRequest<T> {
		return (request: { method: string; headers: HttpHeaders; url: string }) => {
			if (payload) {
				return new HttpRequest(request.method, request.url, JSON.stringify(payload), { headers: request.headers }) as HttpRequest<T>;
			}
			return new HttpRequest(request.method, request.url, null, { headers: request.headers }) as HttpRequest<T>;
		};
	}
}
