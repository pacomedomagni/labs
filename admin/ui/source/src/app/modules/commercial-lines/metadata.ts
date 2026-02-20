import { ApplicationGroupMetadata } from "@modules/shared/data/application.interface";
import { ApplicationGroupIds } from "../shared/data/application-groups.model";
import { policySearch } from "./policy-search/metadata";

export const metadata: ApplicationGroupMetadata =
{
	id: ApplicationGroupIds.CommercialLines,
	name: "Commercial Lines",
	description: "Provides support for commercial lines",
	icon: "emoji_people",
	isReady: true,
	isNonProdOnly: false,
	externalInfo: { url: "http://ubisupport/PortalWeb" },
	applications: [
		policySearch
	],
	access: [
		"isInSupportAdminRole",
		"isCommercialLineRole"
	]
};
