import { TransferPolicySelectionComponent } from "./transfer-policy-selection.component";

function setup() {
	const injectedData = {};

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new TransferPolicySelectionComponent(injectedData);
		}
	};

	return builder;
}

describe("TransferPolicySelectionComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
