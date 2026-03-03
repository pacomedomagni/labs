import { Component, Input, OnInit } from "@angular/core";
import { HelpIcon } from "@modules/core/types/help-text-icon.enum";
import { HelpTextType } from "@modules/core/types/help-text.enum";
import { HelpTextData, HelpTextMap } from "@modules/shared/data/applications-help-text";

import { DialogService } from "@modules/shared/services/dialog-service/dialog.service";

@Component({
    selector: "tmx-help-text",
    templateUrl: "./help-text.component.html",
    styleUrls: ["./help-text.component.scss"],
    standalone: false
})
export class HelpTextComponent implements OnInit {

	@Input() helpKey: string;
	@Input() type: "help" | "alert" | "notification" | HelpTextType = "help";
	@Input() tooltip;

	icon: HelpIcon;
	color: "primary" | "warn";

	private helpTextData: HelpTextData;

	constructor(private dialogService: DialogService) { }

	ngOnInit(): void {
		this.helpTextData = HelpTextMap.get(this.helpKey);
		this.type = this.helpTextData.type ?? this.type;

		switch (this.type) {
			case "help":
			case HelpTextType.Help:
				this.type = "help";
				this.color = "primary";
				this.icon = HelpIcon.Help;
				this.tooltip = this.helpTextData.tooltip ?? this.tooltip ?? "Learn More";
				this.helpTextData.title = this.helpTextData.title ?? this.helpKey;
				break;
			case "alert":
			case HelpTextType.Alert:
				this.type = "alert";
				this.color = "warn";
				this.icon = HelpIcon.Alert;
				this.tooltip = this.helpTextData.tooltip ?? this.tooltip ?? "Corrective Action Needed";
				this.helpTextData.title = this.helpTextData.title ?? "Action Needed";
				break;
			case "notification":
			case HelpTextType.Notification:
				this.type = "notification";
				this.color = "primary";
				this.icon = HelpIcon.Notification;
				this.tooltip = this.helpTextData.content ?? this.tooltip;
				break;
		}

	}

	openHelpText(): void {
		if (this.helpTextData?.externalUrl) {
			window.open(this.helpTextData.externalUrl, "_blank");
		}
		else if (this.helpTextData && this.helpTextData.type !== HelpTextType.Notification) {
			this.dialogService.openHelpTextDialog({ data: this.helpTextData });
		}
	}
}
