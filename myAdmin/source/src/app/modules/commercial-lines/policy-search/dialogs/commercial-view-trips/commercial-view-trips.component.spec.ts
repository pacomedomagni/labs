import { DialogService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { CommercialParticipantService } from "../../services/participant.service";
import { ClViewTripsComponent } from "./commercial-view-trips.component";
import { CommercialPolicyQuery } from "../../stores/comm-policy-query";

function setup() {
	const injectedData = {};
	const diagService = autoSpy(DialogService);
	const partService = autoSpy(CommercialParticipantService);
	const query = autoSpy(CommercialPolicyQuery);
	const builder = {
		default() {
			return builder;
		},
		build() {
			return new ClViewTripsComponent(injectedData, diagService, partService, query);
		}
	};

	return builder;
}

describe("ExcludeDateRangeComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();
		expect(component).toBeTruthy();
	});
});
