import { PolicySearchComponent } from "./policy-search.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new PolicySearchComponent();
		}
	};

	return builder;
}

describe("PolicySearchComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("when onPolicySearch is called with valid policy number it should emit ", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.policySearch, "emit").mockImplementation(() => { });

		component.onPolicySearch("123");

		expect(component.policySearch.emit).toHaveBeenCalledWith("123");
	});

	it("when onPolicySearch is called with invalid policy number it should not emit", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.policySearch, "emit").mockImplementation(() => { });

		component.onPolicySearch("");

		expect(component.policySearch.emit).toHaveBeenCalledTimes(0);
	});

	it("when onPhoneNumberSearch is called with valid phone number it should emit", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.phoneNumberSearch, "emit").mockImplementation(() => { });

		component.onPhoneNumberSearch("(123)-456-7890");

		expect(component.phoneNumberSearch.emit).toHaveBeenCalledWith("1234567890");
	});

	it("when onPhoneNumberSearch is called with invalid phone number it should not emit", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.phoneNumberSearch, "emit").mockImplementation(() => { });

		component.onPhoneNumberSearch("1234");

		expect(component.phoneNumberSearch.emit).toHaveBeenCalledTimes(0);
	});

	it("when onSerialNumberSearch is called with valid device number it should call emit", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.serialNumberSearch, "emit").mockImplementation(() => { });

		component.onSerialNumberSearch("1234K");

		expect(component.serialNumberSearch.emit).toHaveBeenCalledWith("1234K");
	});

	it("when onSerialNumberSearch is called with invalid phone number it should not emit", () => {
		const { build } = setup().default();
		const component = build();
		jest.spyOn(component.serialNumberSearch, "emit").mockImplementation(() => { });

		component.onSerialNumberSearch("");

		expect(component.serialNumberSearch.emit).toHaveBeenCalledTimes(0);
	});
});
