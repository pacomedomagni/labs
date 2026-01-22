import { HelpIcon } from "./help-text-icon.enum";
import { HelpTextType } from "./help-text.enum";

export enum CommonHelpText { }

export class HelpTextData {
	content?: string;
	alignTextLeft?: boolean;
	externalUrl?: string;
	icon?: HelpIcon;
	subtitle?: string;
	title?: string;
	tooltip?: string;
	type?: HelpTextType;
	width?: string;
}