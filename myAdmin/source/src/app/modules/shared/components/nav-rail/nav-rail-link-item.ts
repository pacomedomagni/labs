import { ApplicationGroupIds } from "@modules/shared/data/_index";
import { ApplicationRouteGuard } from "@modules/shared/data/application-groups.model";
import { ExternalAppInfo } from "@modules/shared/data/application.interface";

export interface NavRailLinkItem {
	id: ApplicationGroupIds;
	route: string;
	routeGuard?: ApplicationRouteGuard;
	label: string;
	icon?: string;
	svgIcon?: string;
	isReady: boolean;
	isNonProdOnly: boolean;
	externalInfo?: ExternalAppInfo;
	access: string[];
}
