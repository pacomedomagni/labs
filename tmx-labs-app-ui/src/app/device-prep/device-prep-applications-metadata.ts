import { ApplicationGroupMetadata } from "../shared/data/application/application.interface";
import { metadata as deviceHub } from "./device-staging-hub/device-staging-hub-metadata";
import { metadata as benchTestDevices } from "./bench-test-hub/metadata";

// order in which to display in portal and side menu
export const applicationGroups: ApplicationGroupMetadata[] = [
    deviceHub,
    benchTestDevices,
];
