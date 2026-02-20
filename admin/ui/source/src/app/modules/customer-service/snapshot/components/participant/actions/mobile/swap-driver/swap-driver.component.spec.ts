import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { autoSpy } from "autoSpy";

import { SwapDriverComponent } from "./swap-driver.component";

function setup() {
	const injectedData = {};
	const query = autoSpy(SnapshotPolicyQuery);

	const builder = {
		injectedData,
		query,
		default() {
			return builder;
		},
		build() {
			return new SwapDriverComponent(injectedData, query);
		}
	};

	return builder;
}

describe("SwapDriverComponent", () => {
	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});
});
