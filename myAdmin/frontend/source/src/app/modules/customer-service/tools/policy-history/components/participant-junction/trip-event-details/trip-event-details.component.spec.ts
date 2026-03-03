import { PolicyHistoryService } from "@modules/customer-service/tools/policy-history/services/policy-history.service";
import { autoSpy } from "autoSpy";
import { TripEventDetailsComponent } from "./trip-event-details.component";

function setup() {
	const data: any = {};
	const policyHistoryService = autoSpy(PolicyHistoryService);
	const builder = {
		data,
		policyHistoryService,
		default() {
			return builder;
		},
		build() {
			return new TripEventDetailsComponent(data, policyHistoryService);
		}
	};

	return builder;
}

describe("TripEventDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

});