import { metadata as portal } from "../../../portal/metadata";
import { metadata as device } from "../../metadata/device-metadata";
import { metadata as customerService } from "../../../customer-service/customer-service-metadata";
import {metadata as orderFulfillment} from "../../metadata/order-fulfillment-metadata";
import {metadata as deviceReturns} from "../../metadata/device-returns-metadata";
import {metadata as userManagement} from "../../metadata/user-management-metadata";
import { ApplicationGroupMetadata } from "./application.interface";

// order in which to display in portal and side menu
export const applicationGroups: ApplicationGroupMetadata[] = [
	portal,
	customerService,
	device,
	orderFulfillment,
	deviceReturns,
	userManagement
];
