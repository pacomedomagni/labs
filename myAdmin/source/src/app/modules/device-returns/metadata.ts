import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.DeviceReturns,
	name: "Device Returns",
	description: "Mark plug-in devices as received and return them to our inventory",
	icon: "mobile_off",
	isReady: false,
	externalInfo: { url: "http://ubisupport/DeviceReturnWeb" },
	access: [
		"isInOpsAdminRole",
		"isInOpsUserRole",
		"isInSupportAdminRole"
	]

};
