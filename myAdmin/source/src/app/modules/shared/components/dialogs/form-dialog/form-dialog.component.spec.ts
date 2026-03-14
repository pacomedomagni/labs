import { Component, Injector } from "@angular/core";
import { autoSpy } from "autoSpy";
import { FormDialogComponent } from "./form-dialog.component";

function setup() {
	const data = {
		cancelText: "",
		component: autoSpy(Component),
		componentData: {},
		confirmText: "",
		formModel: {},
		title: "",
		subtitle: "",
		manualSubmission: false,
		helpKey: ""
	};
	const diagRef: any = undefined;
	const injector: Injector = undefined;

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new FormDialogComponent(data, diagRef, injector);
		}
	};

	return builder;
}

describe("FormDialogComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
