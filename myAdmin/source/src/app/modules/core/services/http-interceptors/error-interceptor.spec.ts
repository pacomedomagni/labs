import { HttpErrorResponse, HttpRequest } from "@angular/common/http";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { Router } from "@angular/router";
import { autoSpy } from "autoSpy";
import { throwError } from "rxjs";
import { LoadingService } from "../loading/loading.service";
import { HttpInterceptorErrorService } from "./error-interceptor";

function setup() {
	const router = autoSpy(Router);
	const notificationService = autoSpy(NotificationService);
	const httpRequest = autoSpy(HttpRequest);
	const loadingService = autoSpy(LoadingService);

	const builder = {
		router,
		loadingService,
		httpRequest,
		notificationService,
		default() {
			return builder;
		},
		build() {
			return new HttpInterceptorErrorService(router, loadingService, notificationService);
		}
	};

	return builder;
}

describe("HttpInterceptorErrorService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("when intercept is called", () => {

		test.each([
			{ status: 401, action: "/unauthorized" },
			{ status: 403, action: "/forbidden" },
			{ status: 500, action: "Sorry, your transaction could not be processed. If the issue persists please contact SM." },
			{ status: 999, action: "Oops, something went wrong. If the issue persists please contact SM. " + "\n" }
		])
			("should handle error %s and redirect", (data) => {
				const { build, httpRequest, notificationService } = setup().default();
				const component = build();
				const mockHandler = {
					handle: jest.fn(() => throwError(
						new HttpErrorResponse({
							status: data.status,
							error: {
								Messages: {
									ErrorDetails: "Error Message"
								}
							}
						})))
				};

				const result$ = component.intercept(httpRequest, mockHandler);

				result$.subscribe(() => {
					switch (data.status) {
						case 401:
						case 403:
							expect(component.router.navigateByUrl).toHaveBeenCalledWith(data.action);
							break;
						case 500:
							expect(notificationService.warning).toHaveBeenCalledWith(data.action);
							break;
						default:
							expect(notificationService.warning).toHaveBeenCalledWith(data.action + "Error Message");
							break;
					}
				});
			});
	});

	it("when redirect is called it should navgiate and stop loading", () => {
		const { build, loadingService } = setup().default();
		const component = build();
		const url = "test";

		component.redirect(url);

		expect(component.router.navigateByUrl).toHaveBeenCalledWith("/" + url);
		expect(loadingService.stopLoading).toHaveBeenCalled();
	});

});
