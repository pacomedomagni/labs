import { TrialContainerComponent } from "./trial-container.component";

function setup() {

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new TrialContainerComponent();
		}
	};

	return builder;
}

describe("TrialContainerComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
