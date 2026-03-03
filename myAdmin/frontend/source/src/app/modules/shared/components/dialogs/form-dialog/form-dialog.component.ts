import { AfterViewInit, Component, HostListener, Inject, InjectionToken, Injector, Optional, ViewChild } from "@angular/core";
import clone from "clone";
import { NgForm } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HelpText } from "@modules/customer-service/shared/help/metadata";

export const FORM_DIALOG_CONTENT = new InjectionToken<string>("app.formDiag.content");

@Component({
    selector: "tmx-form-dialog",
    templateUrl: "./form-dialog.component.html",
    styleUrls: ["./form-dialog.component.scss"],
    standalone: false
})
export class FormDialogComponent implements AfterViewInit {
	@ViewChild("dialogForm", { static: false }) form: NgForm;

	loaded = false;
	contentInjector: Injector;
	clonedModel: any;

	constructor(
		@Optional() @Inject(MAT_DIALOG_DATA) public data: {
			cancelText: string;
			component: Component;
			componentData: any;
			confirmText: string;
			formModel: any;
			manualSubmission: boolean;
			title: string;
			subtitle: string;
			helpKey: string | HelpText;
		},
		private dialogRef: MatDialogRef<FormDialogComponent>,
		public injector: Injector) {

	}

	ngAfterViewInit(): void {
		this.clonedModel = clone(this.data.formModel);

		this.contentInjector = Injector.create({
			providers: [{
				provide: FORM_DIALOG_CONTENT,
				useValue: { model: this.clonedModel, data: this.data.componentData, form: this.form, submit: this.onConfirm }
			}],
			parent: this.injector
		});

		setTimeout(() => {
			this.loaded = true;
		});

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
		this.close(this.clonedModel);
	};

	private close(formData?: any): void {
		this.dialogRef.close(formData);
	}

	@HostListener("keydown.esc")
	public onEsc(): void {
		this.close(false);
	}
}
