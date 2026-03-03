import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.Manufacturer,
	name: "Manufacturer",
	description: "Add newly manufactured or refurbished plug-in devices into the UBI Operations database",
	icon: "local_shipping",
	isReady: false,
	externalInfo: { url: "http://ubisupport/ManufacturerWeb" },
	access: [
		"isInOpsAdminRole",
		"isInOpsUserRole",
		"isInSupportAdminRole"
	]

};
