import { EligibleZipCode } from "@modules/shared/data/resources";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { EligibleZipCodesService } from "../services/eligible-zip-codes.service";
import { EligibleZipCodesComponent } from "./eligible-zip-codes.component";

function setup() {
	const service = autoSpy(EligibleZipCodesService);
	const builder = {
		service,
		default() {
			return builder;
		},
		build() {
			return new EligibleZipCodesComponent(service);
		}
	};

	return builder;
}

describe("EligibleZipCodesComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("should set columns correctly", () => {
		const { build } = setup().default();
		const component = build();

		expect(component.columns).toEqual(["state", "zipCode"]);
	});

	describe("describe for search disable", () => {
		test.each([
			{ model: { state: undefined, zipCode: "" }, expected: true },
			{ model: { state: undefined, zipCode: "123" }, expected: true },
			{ model: { state: {}, zipCode: "123" }, expected: false },
			{ model: { state: {}, zipCode: "" }, expected: false }
		])
			("should disable search appropriately when: %s", (data) => {
				const { build } = setup().default();
				const component = build();
				component.model = data.model;
				const result = component.shouldDisableSearch();

				expect(result).toEqual(data.expected);
			});
	});

	describe("describe for search message", () => {
		test.each([
			{ results: [], expected: `It appears we could not find any zip codes matching your search criteria that are eligible for Snapshot` },
			{ results: [{} as EligibleZipCode], expected: `Please enter a state and/or zip code to begin your search` }
		])
			("should set search message appropriately when: %s", (data) => {

				const { build, service } = setup().default();
				service.getEligibleZipCodes.mockReturnValue(of(data.results));

				const component = build();
				component.ngOnInit();

				component.search({});

				expect(component.message).toEqual(data.expected);
			});
	});
});