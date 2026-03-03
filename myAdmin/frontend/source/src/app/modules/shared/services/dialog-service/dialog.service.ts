import { HelpTextData } from "@modules/shared/data/applications-help-text";
import { MatDialog, MatDialogConfig, MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { filter, map, take } from "rxjs/operators";

import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { ConfirmationDialogComponent } from "@modules/shared/components/dialogs/confirmation-dialog/confirmation-dialog.component";
import { FormDialogComponent } from "@modules/shared/components/dialogs/form-dialog/form-dialog.component";
import { InformationDialogComponent } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { Injectable } from "@angular/core";
import { HelpText } from "@modules/customer-service/shared/help/metadata";
import { StaticDataService } from "../static-data/static-data.service";

export interface DialogOptions {
	title: string;
	subtitle?: string;
	message?: string;
	width?: string;
	confirmText?: string;
	hideCancelButton?: boolean;
	alignTextLeft?: boolean;
	helpKey?: string | HelpText;
}

export interface HelpTextDialogOptions {
	data: HelpTextData;
}

export interface InformationDialogOptions<T> extends DialogOptions {
	component: T;
	componentData?: any;
}

export interface FormDialogOptions<T> extends InformationDialogOptions<T> {
	formModel: any;
	manualSubmission?: boolean;
}

@Injectable()
export class DialogService {

	static readonly DefaultDialogOptions = {
		width: CUI_DIALOG_WIDTH.SMALL,
		panelClass: "cui-dialog",
		data: {}
	};

	private dialogRef: MatDialogRef<any>;

	constructor(private dialog: MatDialog, private staticData: StaticDataService) { }

	openConfirmationDialog({
		title,
		subtitle,
		message,
		confirmText,
		hideCancelButton = false,
		alignTextLeft = false,
		helpKey,
		width
	}: DialogOptions): void {
		this.dialogRef = this.openDialog(ConfirmationDialogComponent, {
			...DialogService.DefaultDialogOptions,
			...{
				width: width ?? DialogService.DefaultDialogOptions.width,
				data: {
					cancelText: "Cancel",
					confirmText: confirmText ?? "Yes",
					message,
					title,
					subtitle,
					hideCancelButton,
					alignTextLeft,
					helpKey
				}
			}
		});
	}

	openFormDialog<T>({
		title,
		subtitle,
		component,
		formModel,
		componentData,
		width,
		manualSubmission,
		helpKey
	}: FormDialogOptions<T>): void {
		this.dialogRef = this.openDialog(FormDialogComponent, {
			...DialogService.DefaultDialogOptions,
			...{
				width: width ?? DialogService.DefaultDialogOptions.width,
				data: {
					component,
					componentData,
					cancelText: "Cancel",
					confirmText: "Ok",
					formModel,
					title,
					subtitle,
					manualSubmission,
					helpKey
				}
			}
		});
	}

	openHelpTextDialog({
		data
	}: HelpTextDialogOptions): void {

		if (typeof data.content === "string") {
			this.openConfirmationDialog({
				title: data.title,
				subtitle: data.subtitle,
				message: data.content,
				confirmText: "Ok",
				hideCancelButton: true,
				alignTextLeft: true,
				width: data.width
			});
		}
		else {
			this.openInformationDialog({
				title: data.title,
				subtitle: data.subtitle,
				component: data.content,
				alignTextLeft: true,
				hideCancelButton: true,
				width: data.width
			});
		}
	}

	openInformationDialog<T>({
		title,
		subtitle,
		component,
		componentData,
		width,
		helpKey,
		hideCancelButton = false
	}: InformationDialogOptions<T>): void {
		this.dialogRef = this.openDialog(InformationDialogComponent, {
			...DialogService.DefaultDialogOptions,
			...{
				width: width ?? DialogService.DefaultDialogOptions.width,
				data: {
					component,
					componentData,
					confirmText: "Ok",
					cancelText: "Cancel",
					title,
					subtitle,
					hideCancelButton,
					helpKey
				}
			}
		});
	}

	openDialog<T>(TCtor: new (...args: any[]) => T, data: MatDialogConfig = DialogService.DefaultDialogOptions): MatDialogRef<T, any> {
		const dialogConfig = data;
		dialogConfig.autoFocus = true;
		const dialogRef = this.dialog.open(TCtor, dialogConfig);
		return dialogRef;
	}

	confirmed<T extends any>(): Observable<T> {
		return this.dialogRef.afterClosed()
			.pipe(
				filter(x => x !== undefined),
				take(1),
				map(x => x));
	}

}
