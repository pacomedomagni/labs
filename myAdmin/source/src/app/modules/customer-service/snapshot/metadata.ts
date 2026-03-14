import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	SnapshotDiscount = "Snapshot"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.SnapshotDiscount,
	name: "Snapshot",
	typeId: ApplicationTypeIds.Application,
	description: `
					Allows Internal Users to service Progressive policy holders who currently or previously participated in Snapshot Policy.
					Users can view both Onboard and Mobile Devices.
					They can replace devices, view and exclude trips, as well as other features.
					`,
	isReady: true,
	externalInfo: { url: "http://ubisupport/PolicyCustomerServiceWeb" },
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
