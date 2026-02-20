import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.OrderFulfillment,
	name: "Order Fulfillment",
	description: "Assign plug-in devices to Snapshot participants and print labels for shipment",
	icon: "credit_card",
	isReady: false,
	externalInfo: { url: "http://ubisupport/FulfillmentWeb/" },
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
		"isInMobileRegistrationAdminRole"
	]
};
