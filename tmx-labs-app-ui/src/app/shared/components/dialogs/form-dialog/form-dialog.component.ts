import { AfterViewInit, Component, HostListener, InjectionToken, Injector, Type, ViewChild, inject } from "@angular/core";
import clone from "clone";
import { NgComponentOutlet} from "@angular/common"
import { NgForm, FormsModule } from "@angular/forms";
import { MatDialogRef, MatDialogContent, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { HelpText } from "../../../help/metadata";
import { DialogComponent } from "@pgr-cla/core-ui-components"
import { HelpTextIconComponent } from "../../help-text-icon/help-text-icon.component";
import { MatButtonModule } from "@angular/material/button"
import { DialogSubtitleComponent } from "../../layout/dialog-subtitle/dialog-subtitle.component";

export const FORM_DIALOG_CONTENT = new InjectionToken<string>("app.formDiag.content");

@Component({
    selector: "tmx-form-dialog",
    templateUrl: "./form-dialog.component.html",
    styleUrls: ["./form-dialog.component.scss"],
	imports: [
    DialogComponent,
    NgComponentOutlet,
    HelpTextIconComponent,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    DialogSubtitleComponent
],
})
export class FormDialogComponent implements AfterViewInit  {
	@ViewChild("dialogForm", { static: false }) form: NgForm;

	loaded = false;
	contentInjector: Injector;
	clonedModel: unknown;

	public data = inject<{
		cancelText: string;
		component: Type<unknown>;
		componentData: unknown;
		confirmText: string;
		formModel: unknown;
		manualSubmission: boolean;
		title: string;
		subtitle: string;
		helpKey: string | HelpText;
	}>(MAT_DIALOG_DATA, { optional: true });
	private dialogRef = inject(MatDialogRef<FormDialogComponent>);
	public injector = inject(Injector);

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

	private close(formData?: unknown): void {
		this.dialogRef.close(formData);
	}

	@HostListener("keydown.esc")
	public onEsc(): void {
		this.close(false);
	}
}
