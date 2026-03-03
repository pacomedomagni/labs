import { Component, Injector } from "@angular/core";
import { autoSpy } from "autoSpy";
import { InformationDialogComponent } from "./information-dialog.component";

function setup() {
	const data = {
		confirmText: "",
		cancelText: "",
		component: autoSpy(Component),
		componentData: {},
		title: "",
		subtitle: "",
		hideCancelButton: false,
		helpKey: ""
	};
	const diagRef: any = undefined;
	const injector: Injector = undefined;

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new InformationDialogComponent(data, diagRef, injector);
		}
	};

	return builder;
}

describe("InformationDialogComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
