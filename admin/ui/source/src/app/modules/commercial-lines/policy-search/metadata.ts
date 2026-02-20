import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	PolicySearch = "PolicySearch"
}

export const policySearch: ApplicationMetadata =
{
	id: AppName.PolicySearch,
	name: "Policy Search",
	typeId: ApplicationTypeIds.Application,
	description: `Commercial Lines Policy Search`,
	isReady: true,
	access: [
		"isCommercialLineRole",
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

