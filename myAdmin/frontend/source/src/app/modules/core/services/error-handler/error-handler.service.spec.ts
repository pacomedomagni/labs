import { HttpErrorResponse } from "@angular/common/http";
import { autoSpy } from "autoSpy";
import { ErrorHandlerService } from "./error-handler.service";
import { ApiService } from "../api/api.service";

function setup() {
	const api = autoSpy(ApiService);
	jest.spyOn(console, "log").mockImplementation(() => { });
	jest.spyOn(console, "error").mockImplementation(() => { });
	const builder = {
		api,
		console,
		default() {
			return builder;
		},
		build() {
			return new ErrorHandlerService(api);
		}
	};
	return builder;
}

describe("ErrorHandlerService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("when handleError is called it should", () => {
		const { build, console } = setup().default();
		const component = build();
		const error = new HttpErrorResponse({ status: 500, error: { message: "This is an error" } });

		component.handleError(error);

		expect(console.error).toHaveBeenCalledWith("🚀 ~ Error Handler Service ~ ", error);
	});

});
