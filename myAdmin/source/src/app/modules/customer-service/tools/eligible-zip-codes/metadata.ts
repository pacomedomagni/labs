import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	EligibleZipCodes = "EligibleZipCodes"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.EligibleZipCodes,
	name: "Eligible Zip Codes",
	typeId: ApplicationTypeIds.Tool,
	description: `Eligible Zip Codes`,
	isReady: true,
	externalInfo: { url: "http://ubisupport/PolicyCustomerServiceWeb/Eligibility/EligibleZipCodes" },
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
