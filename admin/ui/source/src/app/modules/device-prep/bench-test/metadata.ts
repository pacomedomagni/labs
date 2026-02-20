import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	DeviceBenchtest = "Benchtest"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.DeviceBenchtest,
	name: "Device Benchtest",
	typeId: ApplicationTypeIds.Application,
	description: `
					Benchtest description.
					`,
	isReady: false,
	externalInfo: { url: "http://ubisupport/DevicePrepWeb/BenchTest/BenchTest" },
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
