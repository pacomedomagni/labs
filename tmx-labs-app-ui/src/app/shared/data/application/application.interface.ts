import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { ApplicationGroupIds, ApplicationRouteGuard, ApplicationTypeIds } from "./application-groups.model";

export interface ApplicationGroupMetadata {
	id: ApplicationGroupIds;
	name: string;
	routeGuard?: ApplicationRouteGuard;
	description: string;
	icon?: string;
	svgIcon?: string;
	faIcon?: IconDefinition;
	isReady: boolean;
	isNonProdOnly?: boolean;
	applications?: ApplicationMetadata[];
	access: string[];
}

export interface ApplicationMetadata {
	id: string;
	typeId: ApplicationTypeIds;
	name: string;
	description: string;
	icon?: string;
	svgIcon?: string;
	faIcon?: IconDefinition;
	isReady: boolean;
	isNonProdOnly?: boolean;
	access: string[];
}
