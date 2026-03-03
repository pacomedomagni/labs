import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	PolicyHistory = "PolicyHistory"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.PolicyHistory,
	name: "Policy History",
	typeId: ApplicationTypeIds.Tool,
	description: `Policy History`,
	isReady: true,
	externalInfo: { url: "http://ubisupport/SupportWeb/Policy/History" },
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
