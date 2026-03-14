import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";
import { userInfoMetadata as userInfoEditor, inputControlTestMetadata as inputControl } from "./debug/metadata";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.Tools,
	name: "Tools",
	description: "Non-prod related tools",
	icon: "construction",
	isReady: true,
	isNonProdOnly: true,
	externalInfo: { url: "http://ubisupport/PortalWeb" },
	applications: [
		userInfoEditor,
		inputControl
	],
	access: [
		"isInOpsAdminRole",
		"isInOpsUserRole",
		"isInSupportAdminRole",
		"isCommercialLineRole",
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
		"isInFeeReversalOnlyRole",
		"isInFeeReversalRole",
		"isInAppChangeRole"
	]

};
