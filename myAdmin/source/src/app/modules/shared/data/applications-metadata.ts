import { ApplicationGroupMetadata } from "./application.interface";
import { metadata as customerService } from "../../customer-service/metadata";
import { metadata as devicePrep } from "../../device-prep/metadata";
import { metadata as deviceReturns } from "../../device-returns/metadata";
import { metadata as manufacturer } from "../../manufacturer/metadata";
import { metadata as orderFulfillment } from "../../order-fulfillment/metadata";
import { metadata as portal } from "../../portal/metadata";
import { metadata as tools } from "../../tools/metadata";
import { metadata as commercialLines } from "../../commercial-lines/metadata";

// order in which to display in portal and side menu
export const applicationGroups: ApplicationGroupMetadata[] = [
	portal,
	customerService,
	devicePrep,
	deviceReturns,
	manufacturer,
	orderFulfillment,
	commercialLines,
	tools
];
