import { ClExcludeDateRangeEditComponent } from "./commercial-exclude-date-range-edit.component";

function setup() {
	const injectedData = {};

	const builder = {
		default() {
			return builder;
		},
		build() {
			const mockDialog = {} as any;
			const mockDatePipe = {} as any;
			return new ClExcludeDateRangeEditComponent(injectedData, mockDialog, mockDatePipe);
		}
	};

	return builder;
}

describe("ExcludeDateRangeEditComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
