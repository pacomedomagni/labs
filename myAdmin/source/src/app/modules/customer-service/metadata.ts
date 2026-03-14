import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";
// import { metadata as commercialLines } from "./commercial-lines/metadata";
import { metadata as snapshot } from "./snapshot/metadata";
import { metadata as deviceHistory } from "./tools/device-history/metadata";
import { metadata as eligibleZipCodes } from "./tools/eligible-zip-codes/metadata";
import { metadata as incidentResolution } from "./tools/incident-resolution/metadata";
import { metadata as ineligibleVehicles } from "./tools/ineligible-vehicles/metadata";
import { metadata as mobileRegistrationSearch } from "./tools/mobile-registration-search/metadata";
import { metadata as policyHistory } from "./tools/policy-history/metadata";
import { metadata as trial } from "./trial/metadata";
import { metadata as are } from "./are/metadata";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.CustomerService,
	name: "Customer Service",
	description: "Provide support for Snapshot participants",
	icon: "emoji_people",
	isReady: true,
	externalInfo: { url: "http://ubisupport/PolicyCustomerServiceWeb" },
	applications: [
		are,
		snapshot,
		trial,
		deviceHistory,
		eligibleZipCodes,
		incidentResolution,
		ineligibleVehicles,
		policyHistory,
		mobileRegistrationSearch
	],
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
		"isInFeeReversalOnlyRole",
		"isInFeeReversalRole",
		"isInAppChangeRole"
	]
};
