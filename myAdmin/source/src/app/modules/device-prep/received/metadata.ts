import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	DeviceReceived = "Received"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.DeviceReceived,
	name: "Receive Device",
	typeId: ApplicationTypeIds.Application,
	description: `
					Device received
					`,
	isReady: false,
	externalInfo: { url: "http://ubisupport/DevicePrepWeb/ReceiveDevices/ReceiveDevices" },
	access: [
		"isInOpsAdminRole",
		"isInOpsUserRole",
		"isInSupportAdminRole",
		"hasEligibilityAccess",
		"hasInsertInitialParticipationScoreInProcessAccess",
		"hasOptOutSuspensionAccess",
		"hasPolicyMergeAccess",
		"hasResetEnrollmentAccess",
		"hasStopShipmentAccess",
		"hasUpdatePProGuidAccess",
		"hasVehicleSupportAccess",
		"isInMobileRegistrationAdminRole",
		"isInTheftOnlyRole",
		"isInTheftRole",
		"isInAppChangeRole"
	]
};
