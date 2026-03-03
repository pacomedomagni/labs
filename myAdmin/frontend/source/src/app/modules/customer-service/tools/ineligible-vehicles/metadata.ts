import { HelpTextType } from "@modules/core/types/help-text.enum";
import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";
import { HelpTextData } from "@modules/shared/data/applications-help-text";

export enum AppName {
	IneligibleVehicles = "IneligibleVehicles"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.IneligibleVehicles,
	name: "Ineligible Vehicles",
	typeId: ApplicationTypeIds.Tool,
	description: `Ineligible Vehicles`,
	isReady: true,
	externalInfo: { url: "http://ubisupport/PolicyCustomerServiceWeb/Eligibility/IneligibleVehicles" },
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

export enum HelpText {
	ExactModelMatch = "ExactModelMatch",
	ExcludedMake = "ExcludedMake"
}

export const helpText: Map<string, HelpTextData> = new Map<string, HelpTextData>([
	[
		HelpText.ExactModelMatch,
		{
			type: HelpTextType.Notification,
			content: `Does the 'Model' listed need to be identical to the one recorded on the policy?`
		}
	],
	[
		HelpText.ExcludedMake,
		{
			type: HelpTextType.Notification,
			content: `Are all vehicles with this 'Make' ineligible?`
		}
	]
]);
