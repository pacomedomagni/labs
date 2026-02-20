import { ElementRef } from "@angular/core";
import { autoSpy } from "autoSpy";
import { FocusDirective } from "./focus.directive";

function setup() {
	const host = autoSpy(ElementRef);
	const builder = {
		host,
		default() {
			return builder;
		},
		build() {
			return new FocusDirective(host);
		}
	};

	return builder;
}

describe("FocusDirective", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();
		expect(component).toBeTruthy();
	});

});

