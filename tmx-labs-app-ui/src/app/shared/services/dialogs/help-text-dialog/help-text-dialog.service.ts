import { inject, Injectable, Type } from '@angular/core';
import { HelpTextDialogOptions } from '../dialogs.models';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { CUI_DIALOG_WIDTH } from '@pgr-cla/core-ui-components';
import { HelpTextDialogComponent } from '../../../components/dialogs/help-text-dialog/help-text-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class HelpTextDialogService {
    static readonly DefaultDialogOptions = {
        width: CUI_DIALOG_WIDTH.SMALL,
        panelClass: 'cui-dialog',
        data: {},
    };

    private matDialog = inject(MatDialog);

    openHelpTextDialog({ data, component, componentData }: HelpTextDialogOptions): MatDialogRef<HelpTextDialogComponent, void | boolean> {
        return this.openDialog(HelpTextDialogComponent, {
            ...HelpTextDialogService.DefaultDialogOptions,
            ...{
                width: data.width ?? HelpTextDialogService.DefaultDialogOptions.width,
                data: {
                    confirmText: 'OK',
                    message: data.content,
                    title: data.title,
                    subtitle: data.subtitle,
                    alignTextLeft: data.alignTextLeft,
                    component: component,
                    componentData: componentData,
                    hideCancelButton: true
                },
            },
        });
    }

    openDialog<TComponent, TResult = unknown>(
        componentClass: Type<TComponent>,
        config: MatDialogConfig = HelpTextDialogService.DefaultDialogOptions,
    ): MatDialogRef<TComponent, TResult> {
        const dialogConfig = config;
        dialogConfig.autoFocus = true;
        return this.matDialog.open<TComponent, unknown, TResult>(componentClass, dialogConfig);
    }
}
