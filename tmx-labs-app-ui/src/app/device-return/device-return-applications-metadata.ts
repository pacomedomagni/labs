import { ApplicationGroupMetadata } from "../shared/data/application/application.interface";
import { metadata as deviceBatches } from "./manage-device-return-batches/metadata";
import { metadata as deviceSingle } from "./single-device-return/metadata";

// order in which to display in portal and side menu
export const applicationGroups: ApplicationGroupMetadata[] = [
    deviceBatches,
    deviceSingle
];
