import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { ApplicationGroupIds, ApplicationRouteGuard } from "../../../data/application/application-groups.model";

export interface NavRailLinkItem {
	id: ApplicationGroupIds;
	route: string;
	routeGuard?: ApplicationRouteGuard;
	label: string;
	icon?: string;
	faIcon?: IconDefinition;
	svgIcon?: string;
	isReady: boolean;
	isNonProdOnly: boolean;
	access: string[];
}
