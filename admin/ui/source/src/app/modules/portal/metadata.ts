import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds, ApplicationTypeIds } from "../shared/data/application-groups.model";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.Portal,
	name: "Portal",
	description: "Portal",
	svgIcon: "ubi_home",
	isReady: true,
	applications: [
		{
			id: "ApplicationSelection",
			name: "Application Selection",
			typeId: ApplicationTypeIds.Application,
			icon: "home",
			description: `
			Admin App is a web UI used for servicing Snapshot devices and data. It allows for both Internal Users
			(Progressive Employees and Internal Progressive Contractors) and External Users (Vendors) access to various
			features controlled by their defined security roles. Here are some of the high-level key features of the Admin
			App`,
			isReady: true,
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
		}
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
