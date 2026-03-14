import { LoadingService } from "@modules/core/services/_index";
import { autoSpy } from "autoSpy";
import { SpinnerComponent } from "./spinner.component";

function setup() {
	const loadingService = autoSpy(LoadingService);
	const builder = {
		loadingService,
		default() {
			return builder;
		},
		build() {
			return new SpinnerComponent(loadingService);
		}
	};

	return builder;
}

describe("SpinnerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});
