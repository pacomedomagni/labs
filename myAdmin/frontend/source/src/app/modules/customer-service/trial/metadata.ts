import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	SnapshotTrial = "Trial"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.SnapshotTrial,
	name: "Snapshot Trial",
	typeId: ApplicationTypeIds.Application,
	description: `
					Snapshot Trial allows Internal Users to service participants in the Snapshot Trial program.
					Users can also view participants who migrated to Snapshot Policy.
					`,
	isReady: false,
	externalInfo: { url: "http://ubisupport/TrialCustomerServiceWeb" },
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
		"isInAppChangeRole"]

};
