import { HttpClient } from "@angular/common/http";
import { autoSpy } from "autoSpy";
import { StaticDataService } from "./static-data.service";

function setup() {
	const http = autoSpy(HttpClient);
	const sanitizer: any = {};

	const builder = {
		http,
		sanitizer,
		default() {
			return builder;
		},
		build() {
			return new StaticDataService(http, sanitizer);
		}
	};

	return builder;
}

describe("StaticDataService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
