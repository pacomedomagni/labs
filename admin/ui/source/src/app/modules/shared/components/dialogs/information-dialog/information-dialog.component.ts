import { Component, HostListener, Inject, InjectionToken, Injector, Optional } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HelpText } from "@modules/customer-service/shared/help/metadata";

export const INFO_DIALOG_CONTENT = new InjectionToken<string>("app.infoDiag.content");

@Component({
    selector: "tmx-information-dialog",
    templateUrl: "./information-dialog.component.html",
    styleUrls: ["./information-dialog.component.scss"],
    standalone: false
})
export class InformationDialogComponent {
	contentInjector: Injector;

	constructor(
		@Optional() @Inject(MAT_DIALOG_DATA) public data: {
			confirmText: string;
			cancelText: string;
			component: Component;
			componentData: any;
			title: string;
			subtitle: string;
			hideCancelButton: boolean;
			helpKey: string | HelpText;
		},
		private dialogRef: MatDialogRef<InformationDialogComponent>,
		public injector: Injector) {
		this.contentInjector = Injector.create({ providers: [{ provide: INFO_DIALOG_CONTENT, useValue: data.componentData }], parent: injector });
	}

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

	private close(result?: boolean): void {
		this.dialogRef.close(result);
	}

	@HostListener("keydown.esc")
	public onEsc(): void {
		this.close();
	}
}
