import { ApplicationTypeIds } from "@modules/shared/data/application-groups.model";
import { ApplicationMetadata } from "@modules/shared/data/application.interface";

export enum AppName {
	MobileRegistrationSearch = "MobileRegistrationSearch"
}

export const metadata: ApplicationMetadata =
{
	id: AppName.MobileRegistrationSearch,
	name: "Mobile Registration Search",
	typeId: ApplicationTypeIds.Tool,
	description: `Mobile Registration Search`,
	isReady: true,
	access: [
		"isInMobileRegSearchPilot"
	]
};
