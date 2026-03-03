import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	DeviceHistory = "DeviceHistory"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.DeviceHistory,
	name: "Device History",
	typeId: ApplicationTypeIds.Tool,
	description: `Device History`,
	isReady: true,
	externalInfo: { url: "http://ubisupport/PolicyCustomerServiceWeb/Search/Device" },
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
