import { SnapshotScoreInfoComponent } from "./snapshot-score-info.component";

function setup() {
	const injectedData = {};

	const builder = {
		default() {
			return builder;
		},
		build() {
			return new SnapshotScoreInfoComponent(injectedData);
		}
	};

	return builder;
}

describe("SnapshotScoreInfoComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
