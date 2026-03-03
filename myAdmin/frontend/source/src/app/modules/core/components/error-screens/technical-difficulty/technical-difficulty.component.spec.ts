import { ActivatedRoute } from "@angular/router";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { TechnicalDifficultyComponent } from "./technical-difficulty.component";

function setup() {
	const route = autoSpy(ActivatedRoute);
	route.data = of({});
	const dialogData = {};
	const builder = {
		route,
		dialogData,
		default() {
			return builder;
		},
		build() {
			return new TechnicalDifficultyComponent(route, dialogData);
		}
	};

	return builder;
}

describe("TechnicalDifficultyComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	test.each([
		{ key: "route", value: { title: "title route", message: "message route" } },
		{ key: "data", value: { title: "title data", message: "message data" } }])
		("should use %s when passed to display page info", (data) => {
			const { build, route } = setup().default();
			const component = build();
			if (data.key === "route") { route.data = of(data.value); }
			if (data.key === "data") { component.dialogData = data.value; }

			component.ngOnInit();
			expect(component.title).toEqual(`title ${data.key}`);
			expect(component.message).toEqual(`message ${data.key}`);
			expect(component.helpDeskNumber).toEqual("888-746-4500");
		});

	it("should use default messaging when no passed data", () => {
		const { build } = setup().default();
		const component = build();

		component.ngOnInit();

		expect(component.title).toEqual("Oops! Something went wrong!");
		expect(component.message).toEqual("Looks like something went wrong loading the page.");
		expect(component.helpDeskNumber).toEqual("888-746-4500");
	});

});
