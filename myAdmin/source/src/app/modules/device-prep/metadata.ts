import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";

import { metadata as activation } from "./activation/metadata";
import { metadata as benchTest } from "./bench-test/metadata";
import { metadata as received } from "./received/metadata";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.DevicePrep,
	name: "Device Preparation",
	description: "Receive, activate, and bench test plug-in devices before they are distributed to Snapshot participants",
	icon: "mobile_friendly",
	isReady: false,
	externalInfo: { url: "http://ubisupport/DevicePrepWeb/" },
	applications: [
		activation,
		benchTest,
		received
	],
	access: [
		"isInOpsAdminRole",
		"isInOpsUserRole",
		"isInSupportAdminRole"
	]
};
