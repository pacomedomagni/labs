import { ApplicationGroupIds, ApplicationRouteGuard, ApplicationTypeIds } from "./application-groups.model";

export interface ApplicationGroupMetadata {
	id: ApplicationGroupIds;
	name: string;
	routeGuard?: ApplicationRouteGuard;
	description: string;
	icon?: string;
	svgIcon?: string;
	isReady: boolean;
	isNonProdOnly?: boolean;
	externalInfo?: ExternalAppInfo;
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
	isReady: boolean;
	isNonProdOnly?: boolean;
	externalInfo?: ExternalAppInfo;
	access: string[];
}

export interface ExternalAppInfo {
	url: string;
}
