import { Component, Input, OnInit, inject } from "@angular/core";
import { MatIconModule } from "@angular/material/icon";
import { NgClass } from "@angular/common";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatButtonModule } from "@angular/material/button";

// Import from constants instead of data to avoid circular dependency
import { HelpTextData } from "../../data/application/help-text/applications-help-text";
import { HelpTextDialogService } from "../../services/dialogs/help-text-dialog/help-text-dialog.service";
import { HelpTextType } from "../../data/application/help-text/help-text.enum";
import { HelpIcon } from "../../data/application/help-text/help-text-icon.enum";
import { HelpTextMap } from "../../data/application/help-text/help-text-map";

@Component({
  selector: "tmx-help-text",
  templateUrl: "./help-text-icon.component.html",
  styleUrls: ["./help-text-icon.component.scss"],
  imports: [
    MatIconModule,
    NgClass,
    MatTooltipModule,
    MatButtonModule
  ]
})
export class HelpTextIconComponent implements OnInit {
  @Input() helpKey: string;
  @Input() type: "help" | "alert" | "notification" | HelpTextType = "help";
  @Input() tooltip: string;

  icon: HelpIcon;
  color: "primary" | "warn";
  private helpTextData: HelpTextData;
  private helpTextDialogService = inject(HelpTextDialogService);

  ngOnInit(): void {
    this.helpTextData = HelpTextMap.get(this.helpKey);

    if (!this.helpTextData) {
      console.warn(`Help text not found for key: ${this.helpKey}`);
      return;
    }

    // Use the type from helpTextData if available, otherwise use input
    this.type = this.helpTextData.type ?? this.type;

    switch (this.type) {
      case "help":
      case HelpTextType.Help:
        this.type = "help";
        this.color = "primary";
        this.icon = HelpIcon.Help;
        this.tooltip = this.helpTextData.tooltip ?? this.tooltip ?? "Learn More";
        this.helpTextData.title = this.helpTextData.title ?? this.helpKey;
        this.helpTextData.alignTextLeft = true;
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
      window.open(this.helpTextData.externalUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (this.helpTextData && this.helpTextData.type !== HelpTextType.Notification) {
      this.helpTextDialogService.openHelpTextDialog({ data: this.helpTextData });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.openHelpText();
    }
  }
}
