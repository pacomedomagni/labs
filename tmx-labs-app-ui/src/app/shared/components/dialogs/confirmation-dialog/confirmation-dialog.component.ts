import { Component, HostListener, inject } from "@angular/core";
import { MatDialogRef, MatDialogContent, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {DialogComponent} from "@pgr-cla/core-ui-components"
import { HelpText } from "../../../help/metadata";
import { NgClass } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HelpTextIconComponent } from "../../help-text-icon/help-text-icon.component";
import { MatButtonModule } from "@angular/material/button";
import { DialogSubtitleComponent } from "../../layout/dialog-subtitle/dialog-subtitle.component";

@Component({
    selector: "tmx-confirmation-dialog",
    templateUrl: "./confirmation-dialog.component.html",
    styleUrls: ["./confirmation-dialog.component.scss"],
	imports: [
		DialogComponent,
		NgClass,
		HelpTextIconComponent,
		DialogSubtitleComponent,
		FormsModule,
		MatButtonModule,
		MatDialogTitle,
		MatDialogContent
	]

})
export class ConfirmationDialogComponent {

	public data = inject<{
		cancelText: string;
		confirmText: string;
		message: string;
		title: string;
		subtitle: string;
		hideCancelButton: boolean;
		alignTextLeft: boolean;
		helpKey: string | HelpText;
	}>(MAT_DIALOG_DATA, { optional: true });
	private dialogRef = inject(MatDialogRef<ConfirmationDialogComponent>);

	shouldDisplaySubtitle(): boolean {
		return this.data.subtitle ? true : false;
	}

	onClose = () => {
		this.close();
	};

	onCancel = () => {
		this.close();
	};

	onConfirm = () => {
		this.close(true);
	};

	private close(value?: boolean): void {
		this.dialogRef.close(value);
	}

	@HostListener("keydown.esc")
	public onEsc(): void {
		this.close();
	}
}
