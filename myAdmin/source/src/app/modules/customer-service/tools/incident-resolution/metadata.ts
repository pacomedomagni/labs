import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	IncidentResolution = "IncidentResolution"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.IncidentResolution,
	name: "Incident Resolution",
	typeId: ApplicationTypeIds.Tool,
	description: `Incident Resolution`,
	isReady: true,
	externalInfo: { url: "http://ubisupport/SupportWeb/IncidentResolution/Management" },
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
