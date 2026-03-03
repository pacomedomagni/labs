import { NgForm } from "@angular/forms";
import { EnrollmentDate20Component } from "@modules/customer-service/snapshot/components/_index";
import { ParticipantService } from "@modules/customer-service/snapshot/services/participant.service";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { ParticipantReasonCode } from "@modules/shared/data/enums";
import { InitialParticipantScoreInProcess, Participant, Policy, PolicyPeriod, SnapshotParticipantDetails } from "@modules/shared/data/resources";
import { getToday } from "@modules/shared/utils/datetime-utils";
import { autoSpy } from "autoSpy";
import { of } from "rxjs";

const today = getToday();

function setup() {
	const injectedData = {
		form: {} as NgForm,
		model: {},
		data: {
			inceptionDate: new Date(),
			participant: {
				snapshotDetails: { enrollmentDate: new Date() } as SnapshotParticipantDetails
			} as Participant
		}
	};
	const participantService = autoSpy(ParticipantService);
	const query = autoSpy(SnapshotPolicyQuery);
	query.policy$ = of({
		policyPeriodDetails: [{ inceptionDate: new Date() }]
	} as Policy);

	const builder = {
		query,
		injectedData,
		participantService,
		default() {
			return builder;
		},
		build() {
			return new EnrollmentDate20Component(injectedData, participantService, query);
		}
	};

	return builder;
}

describe("EnrollmentDate20Component", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for enrollment 2.0 date pre-check", () => {
		test.each([
			{ inceptionDate: true, message: "Cannot change Enrollment Date on future dated policy terms", expected: false },
			{ reasonCode: ParticipantReasonCode.NeedsDeviceAssigned, message: "Cannot change Enrollment Date until a plug-in device has been assigned", expected: false },
			{ message: `Initial Score data is missing for this Snapshot 2.0 vehicle.\n\nTo resolve this issue:\n(1) open the Initial Discount action and\n(2) select 'Insert Record'`, expected: false },
			{ initialDiscount: { isScoreCalculated: true } as InitialParticipantScoreInProcess, expected: true }
		])
			("should evaluate pre-check appropriately when: %s", (data) => {
				const { build, query, injectedData, participantService } = setup().default();
				injectedData.data.participant.snapshotDetails.reasonCode = data.reasonCode ?? ParticipantReasonCode.CollectingData;
				participantService.getInitialParticipantScoreInProcess.mockReturnValue(of(data.initialDiscount ?? null));
				const date = new Date(today);
				if (data.inceptionDate) {
					date.setDate(today.getDate() + 1);
				}
				else {
					date.setDate(today.getDate());
				}
				//query.policy$ = of({ inceptionDate: date } as Policy);
				query.policy$ = of({ policyPeriodDetails: [{ inceptionDate: date } as PolicyPeriod] } as Policy);
				const component = build();

				component.ngOnInit();

				expect(component.preCheckCompleted).toEqual(true);
				expect(component.preCheckPassed).toEqual(data.expected);
				expect(component.preCheckError).toEqual(data.message);
				expect(component.isScoreCalculated).toEqual(data.initialDiscount ? true : undefined);

			});
	});

	describe("describe logic for should recalculate", () => {
		test.each([
			{ isScoreCalculated: true, selectedPProStatus: 4, datesOlderThan30: true, expected: false },
			{ isScoreCalculated: false, selectedPProStatus: 4, datesOlderThan30: true, expected: true },
			{ isScoreCalculated: true, selectedPProStatus: 1, datesOlderThan30: true, expected: true },
			{ isScoreCalculated: true, selectedPProStatus: 4, datesOlderThan30: false, expected: true }
		])
			("should evaluate if recalculate is needed when: %s", (data) => {
				const { build } = setup().default();
				const component = build();
				component.model = { enrollmentDate: new Date(2021, 7, 1), shouldRecalculate: undefined };
				component.isScoreCalculated = data.isScoreCalculated;
				component.selectedPProStatus = data.selectedPProStatus;
				component["datesOlderThan30"] = data.datesOlderThan30;

				component.clearEnrollment();

				expect(component.model.enrollmentDate).toEqual(undefined);
				expect(component.model.shouldRecalculate).toEqual(data.expected);
			});
	});
});

