
import { FormBuilder } from "@angular/forms";
import { SnapshotPolicyQuery } from "@modules/customer-service/snapshot/stores/_index";
import { DeviceExperience, ProgramType } from "@modules/shared/data/enums";
import { PluginDevice, Participant, SnapshotParticipantDetails } from "@modules/shared/data/resources";
import { PhoneNumberPipe } from "@modules/shared/pipes/phoneNumber.pipe";
import { HelperService, LabelService } from "@modules/shared/services/_index";
import { autoSpy } from "autoSpy";
import { ParticipantMergeComponent } from "./participant-merge.component";

function setup() {
	const injectedData = {};
	const helper = autoSpy(HelperService);
	const labelService = autoSpy(LabelService);
	const query = autoSpy(SnapshotPolicyQuery);
	const fb = autoSpy(FormBuilder);
	const phoneNumberPipe = autoSpy(PhoneNumberPipe);

	const builder = {
		injectedData,
		helper,
		labelService,
		query,
		fb,
		phoneNumberPipe,
		default() {
			return builder;
		},
		build() {
			return new ParticipantMergeComponent(injectedData, helper, labelService, query, fb, phoneNumberPipe);
		}
	};

	return builder;
}

describe("ParticipantMergeComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
	});

	describe("describe for participant merge edits", () => {

		test.each([
			{ id1: "123", id2: "456", expected: false },
			{ id1: "123", id2: "123", expected: true }
		])
			("should restrict second participant when participant ids are identical: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				const first = { snapshotDetails: { participantId: data.id1 } as SnapshotParticipantDetails } as Participant;
				const second = { snapshotDetails: { participantId: data.id2 } as SnapshotParticipantDetails } as Participant;

				const hasEdit = component.unableToMergeIdenticalParticipants(first, second);

				expect(hasEdit).toEqual(data.expected);
			});

		test.each([
			{ experience1: DeviceExperience.Mobile, experience2: DeviceExperience.Mobile, expected: false },
			{ experience1: DeviceExperience.Device, experience2: DeviceExperience.Device, expected: false },
			{ experience1: DeviceExperience.Mobile, experience2: DeviceExperience.Device, expected: false },
			{ experience1: DeviceExperience.Device, experience2: DeviceExperience.Mobile, expected: true }
		])
			("should restrict second participant when mobile and first is OBD: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				const first = { snapshotDetails: { enrollmentExperience: data.experience1 } as SnapshotParticipantDetails } as Participant;
				const second = { snapshotDetails: { enrollmentExperience: data.experience2 } as SnapshotParticipantDetails } as Participant;

				const hasEdit = component.unableToMergeMobileIntoPlugin(first, second);

				expect(hasEdit).toEqual(data.expected);
			});

		test.each([
			{ experience1: DeviceExperience.Device, seqId: 123, expected: false },
			{ experience1: DeviceExperience.Mobile, seqId: undefined, expected: false },
			{ experience1: DeviceExperience.Mobile, seqId: 123, expected: true }
		])
			("should restrict second participant when mobile and device seq id present: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				const first = { snapshotDetails: { enrollmentExperience: data.experience1 } as SnapshotParticipantDetails } as Participant;
				const second = {
					snapshotDetails: { enrollmentExperience: DeviceExperience.Device },
					pluginDeviceDetails: { deviceSeqId: data.seqId } as PluginDevice
				} as Participant;

				const hasEdit = component.unableToMergeDeviceIntoMobileIfAssigned(first, second);

				expect(hasEdit).toEqual(data.expected);
			});

		test.each([
			{ status1: "Active", status2: "Active", expected: true },
			{ status1: "Inactive-Abandoned", status2: "Active", expected: false },
			{ status1: "Inactive-Recycled", status2: "Active", expected: false },
			{ status1: "Inactive-CustomerReturn", status2: "Active", expected: false },
			{ status1: "Inactive-Defective", status2: "Active", expected: false },
			{ status2: "Inactive-Abandoned", status1: "Active", expected: false },
			{ status2: "Inactive-Recycled", status1: "Active", expected: false },
			{ status2: "Inactive-CustomerReturn", status1: "Active", expected: false },
			{ status2: "Inactive-Defective", status1: "Active", expected: false },
			{ status1: undefined, status2: "Active", expected: false },
			{ status1: "", status2: "Active", expected: false },
			{ status1: "Active", status2: undefined, expected: false },
			{ status1: "Active", status2: "", expected: false }
		])
			("should restrict second participant when both participants have devices assigned: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				const first = {
					snapshotDetails: { enrollmentExperience: DeviceExperience.Device },
					pluginDeviceDetails: { wirelessStatus: data.status1 } as PluginDevice
				} as Participant;
				const second = {
					snapshotDetails: { enrollmentExperience: DeviceExperience.Device },
					pluginDeviceDetails: { wirelessStatus: data.status2 } as PluginDevice
				} as Participant;

				const hasEdit = component.unableToMergeBothDeviceAssigned(first, second);

				expect(hasEdit).toEqual(data.expected);
			});

		test.each([
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel5,
				experience2: DeviceExperience.Device, program2: ProgramType.PriceModel3,
				expected: true
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel4,
				experience2: DeviceExperience.Device, program2: ProgramType.PriceModel3,
				expected: true
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel4,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel2,
				expected: true
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel4,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel3,
				expected: true
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel3,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel3,
				expected: false
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel4,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel5,
				expected: false
			},
			{
				experience1: DeviceExperience.Device, program1: ProgramType.PriceModel4,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel5,
				expected: false
			}
		])
			("should restrict second participant when participant ids are identical: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				const first = { snapshotDetails: { enrollmentExperience: data.experience1, programType: data.program1 } as SnapshotParticipantDetails } as Participant;
				const second = { snapshotDetails: { enrollmentExperience: data.experience2, programType: data.program2 } as SnapshotParticipantDetails } as Participant;

				const hasEdit = component.unableToMergeMobile4OrGreaterParticipant(first, second);

				expect(hasEdit).toEqual(data.expected);
			});

		test.each([
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel5,
				experience2: DeviceExperience.Device, program2: ProgramType.PriceModel3,
				expected: false
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel3,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel3,
				expected: false
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel3,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel4,
				expected: true
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel3,
				experience2: DeviceExperience.Mobile, program2: ProgramType.PriceModel5,
				expected: true
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel3,
				experience2: DeviceExperience.Device, program2: ProgramType.PriceModel3,
				expected: false
			},
			{
				experience1: DeviceExperience.Mobile, program1: ProgramType.PriceModel4,
				experience2: DeviceExperience.Device, program2: ProgramType.PriceModel5,
				expected: false
			}
		])
			("should restrict second participant when participant is mobile 4+ and first is mobile 3: %s", (data) => {
				const { build } = setup().default();
				const component = build();

				const first = { snapshotDetails: { enrollmentExperience: data.experience1, programType: data.program1 } as SnapshotParticipantDetails } as Participant;
				const second = { snapshotDetails: { enrollmentExperience: data.experience2, programType: data.program2 } as SnapshotParticipantDetails } as Participant;

				const hasEdit = component.unableToMergeMobile3IntoHigher(first, second);

				expect(hasEdit).toEqual(data.expected);
			});
	});
});
