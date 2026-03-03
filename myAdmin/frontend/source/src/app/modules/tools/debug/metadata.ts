import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	UserInfoEditor = "UserInfoEditor",
	InputControlTest = "InputControlTest"
}

export const userInfoMetadata: ApplicationMetadata =
{
	id: AppName.UserInfoEditor,
	name: "User Info Editor",
	typeId: ApplicationTypeIds.Application,
	description: `User Info Editor`,
	isReady: true,
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

export const inputControlTestMetadata: ApplicationMetadata = {
	id: AppName.InputControlTest,
	name: "Input Control Test",
	typeId: ApplicationTypeIds.Application,
	description: `Input Control Test`,
	isReady: true,
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
