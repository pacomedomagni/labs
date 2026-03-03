import { Router } from "@angular/router";
import { autoSpy } from "autoSpy";
import { UnauthorizedComponent } from "./unauthorized.component";

function setup() {
	const router = autoSpy(Router);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new UnauthorizedComponent(router);
		}
	};

	return builder;
}

describe("UnauthorizedComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();
		expect(component).toBeTruthy();
	});

});
