import { RenewalScoresComponent } from "./renewal-scores.component";

function setup() {
	const injectedData = {};

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new RenewalScoresComponent(injectedData);
		}
	};

	return builder;
}

describe("RenewalScoresComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
