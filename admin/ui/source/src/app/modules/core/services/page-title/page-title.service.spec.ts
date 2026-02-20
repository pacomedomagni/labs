import { Title } from "@angular/platform-browser";
import { autoSpy } from "autoSpy";
import { PageTitleService } from "./page-title.service";

function setup() {
	const titleService = autoSpy(Title);
	const appName = "TMX Admin";
	const builder = {
		appName,
		titleService,
		default() {
			return builder;
		},
		build() {
			return new PageTitleService(titleService);
		}
	};

	return builder;
}

describe("PageTitleService", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should update page title", () => {
		const { build, appName, titleService } = setup().default();
		const component = build();

		component.title = "New Title";

		expect(component.title).toEqual("New Title");
		expect(titleService.setTitle).toHaveBeenCalledWith("New Title ❘ " + appName);
	});

	it("should use blank if empty title", () => {
		const { build, appName, titleService } = setup().default();
		const component = build();

		component.title = "";

		expect(component.title).toEqual("");
		expect(titleService.setTitle).toHaveBeenCalledWith(appName);
	});

});

