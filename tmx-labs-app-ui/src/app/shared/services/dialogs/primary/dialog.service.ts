import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';
import { ConfirmationDialogComponent } from '../../../components/dialogs/confirmation-dialog/confirmation-dialog.component';
import { FormDialogComponent } from '../../../components/dialogs/form-dialog/form-dialog.component';
import { InformationDialogComponent } from '../../../components/dialogs/information-dialog/information-dialog.component';
import { Injectable, Type, inject } from '@angular/core';
import { DialogOptions, FormDialogOptions, InformationDialogOptions, TableDialogOptions } from '../dialogs.models';
import { TableDialogComponent } from 'src/app/shared/components/dialogs/table-dialog/table-dialog.component';

@Injectable({ providedIn: 'root' })
export class DialogService {
    static readonly DefaultDialogOptions = {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        data: {},
    };

    private dialog = inject(MatDialog);

    openConfirmationDialog({
        title,
        subtitle,
        message,
        confirmText,
        cancelText,
        hideCancelButton = false,
        alignTextLeft = false,
        helpKey,
        width,
    }: DialogOptions): MatDialogRef<ConfirmationDialogComponent, boolean> {
        return this.openDialog(ConfirmationDialogComponent, {
            ...DialogService.DefaultDialogOptions,
            ...{
                width: width ?? DialogService.DefaultDialogOptions.width,
                data: {
                    cancelText: cancelText ?? 'Cancel',
                    confirmText: confirmText ?? 'Yes',
                    message,
                    title,
                    subtitle,
                    hideCancelButton,
                    alignTextLeft,
                    helpKey,
                },
            },
        });
    }

    openInformationDialog<T, T2>({
        title,
        subtitle,
        component,
        componentData,
        subtitleComponent,
        subtitleComponentData,
        width,
        maxWidth,
        height,
        maxHeight,
        dialogContentClass,
        helpKey,
        hideCancelButton = false,
    }: InformationDialogOptions<T, T2>): MatDialogRef<InformationDialogComponent> {
        return this.openDialog(InformationDialogComponent, {
            ...DialogService.DefaultDialogOptions,
            ...{
                width: width ?? DialogService.DefaultDialogOptions.width,
                maxWidth: maxWidth ?? '80vw',
                height: height ?? '250px',
                maxHeight: maxHeight ?? '90vh',
                data: {
                    component,
                    componentData,
                    subtitleComponent,
                    subtitleComponentData,
                    confirmText: 'Ok',
                    cancelText: 'Cancel',
                    title,
                    subtitle,
                    hideCancelButton,
                    helpKey,
                    dialogContentClass,
                },
            },
        });
    }

    /**
     * Open a table dialog with mat-paginator buttons in the dialog actions section. Paginator can be 
     * accessed from the injected TABLE_DIALOG_PAGINATOR token in the child component.
     * @returns MatDialogRef<InformationDialogComponent>
     */
    openTableDialog<T, T2>({
        title,
        subtitle,
        component,
        componentData,
        subtitleComponent,
        subtitleComponentData,
        width,
        maxWidth,
        height,
        maxHeight,
        dialogContentClass,
        helpKey,
        hideCancelButton = false,
        confirmText,
        cancelText,
    }: TableDialogOptions<T, T2>): MatDialogRef<TableDialogComponent> {
        return this.openDialog(TableDialogComponent, {
            ...DialogService.DefaultDialogOptions,
            ...{
                width: width ?? DialogService.DefaultDialogOptions.width,
                maxWidth: maxWidth ?? '80vw',
                height: height ?? '250px',
                maxHeight: maxHeight ?? '90vh',
                data: {
                    component,
                    componentData,
                    subtitleComponent,
                    subtitleComponentData,
                    confirmText: confirmText ?? 'Ok',
                    cancelText: cancelText ?? 'Cancel',
                    title,
                    subtitle,
                    hideCancelButton,
                    helpKey,
                    dialogContentClass,
                },
            },
        });
    }

    openFormDialog<TComponent, TResult = unknown>({
        title,
        subtitle,
        component,
        confirmText,
        formModel,
        componentData,
        width,
        manualSubmission,
        helpKey,
    }: FormDialogOptions<TComponent>): MatDialogRef<FormDialogComponent, TResult> {
        return this.openDialog<FormDialogComponent, TResult>(FormDialogComponent, {
            ...DialogService.DefaultDialogOptions,
            ...{
                width: width ?? DialogService.DefaultDialogOptions.width,
                data: {
                    component,
                    componentData,
                    cancelText: 'Cancel',
                    confirmText: confirmText ?? 'Ok',
                    formModel,
                    title,
                    subtitle,
                    manualSubmission,
                    helpKey,
                },
            },
        });
    }

    openDialog<TComponent, TResult = unknown>(
        componentClass: Type<TComponent>,
        config: MatDialogConfig = DialogService.DefaultDialogOptions,
    ): MatDialogRef<TComponent, TResult> {
        const dialogConfig = config;
        dialogConfig.autoFocus = true;
        return this.dialog.open<TComponent, unknown, TResult>(componentClass, dialogConfig);
    }
}
