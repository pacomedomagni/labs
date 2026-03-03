import { CompatibilityItem, Participant } from "@modules/shared/data/resources";
import { DialogService, LabelService } from "@modules/shared/services/_index";

import { ParticipantService } from "@modules/customer-service/snapshot/services/_index";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { DeviceExperience } from "@modules/shared/data/enums";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { CompatibilityDetailsComponent } from "./compatibility-details.component";

function setup() {
	const diagService = autoSpy(DialogService);
	diagService.confirmed.mockReturnValue(of(undefined));
	const labelService = autoSpy(LabelService);
	const participantService = autoSpy(ParticipantService);
	const notificationService = autoSpy(NotificationService);
	const query = autoSpy(SnapshotPolicyQuery);
	const injectedData = {} as any;
	const participant = { snapshotDetails: { enrollmentExperience: DeviceExperience.Mobile } } as Participant;

	const builder = {
		diagService,
		labelService,
		query,
		injectedData,
		participant,
		default() {
			return builder;
		},
		build() {
			return new CompatibilityDetailsComponent(injectedData, diagService, labelService, participantService, notificationService, query);
		}
	};

	return builder;
}

describe("CompatibilityDetailsComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	it("open edit dialog when selected", () => {
		const { build, diagService, participant } = setup().default();
		const component = build();

		component.participant = participant;
		component.editItem({} as CompatibilityItem);

		expect(diagService.openFormDialog).toHaveBeenCalled();
	});
});
