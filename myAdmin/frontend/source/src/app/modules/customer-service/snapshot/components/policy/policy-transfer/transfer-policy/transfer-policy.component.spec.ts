import { TransferPolicyComponent } from "./transfer-policy.component";

function setup() {
	const injectedData = {};

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new TransferPolicyComponent(injectedData);
		}
	};

	return builder;
}

describe("TransferPolicyComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
