import { HelpTextData } from "./applications-help-text";
import { helpText as customerServiceHelpText } from "../../../help/metadata";

export const HelpTextMap = new Map<string, HelpTextData>([
	...customerServiceHelpText
]);
