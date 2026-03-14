import { HelpIcon } from "@modules/core/types/help-text-icon.enum";
import { HelpTextType } from "@modules/core/types/help-text.enum";
import { helpText as customerServiceHelpText } from "../../customer-service/shared/help/metadata";

export enum CommonHelpText { }

export class HelpTextData {
	content?: any;
	alignTextLeft?: boolean;
	externalUrl?: string;
	icon?: HelpIcon;
	subtitle?: string;
	title?: string;
	tooltip?: string;
	type?: HelpTextType;
	width?: string;
}

export const HelpTextMap = new Map<string, HelpTextData>([
	...customerServiceHelpText
]);
