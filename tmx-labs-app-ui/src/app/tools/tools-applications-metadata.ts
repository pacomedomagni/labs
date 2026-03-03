import { ApplicationGroupMetadata } from "../shared/data/application/application.interface";
import { metadata as userInfoEditor } from "./user-info-editor/user-info-editor-metadata";
import { metadata as inputControlTest } from "./input-control-test/input-control-test-metadata";

// order in which to display in portal and side menu
export const applicationGroups: ApplicationGroupMetadata[] = [
    userInfoEditor,
    inputControlTest,
];
