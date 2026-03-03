import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	DeviceActivation = "Activation"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.DeviceActivation,
	name: "Device Activation",
	typeId: ApplicationTypeIds.Application,
	description: `
					Device activation
					`,
	isReady: false,
	externalInfo: { url: "http://ubisupport/DevicePrepWeb/DeviceActivation/DeviceActivation" },
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
