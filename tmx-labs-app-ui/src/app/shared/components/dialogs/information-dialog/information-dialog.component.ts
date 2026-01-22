import { Component, HostListener, InjectionToken, Injector, Type, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HelpText } from '../../../help/metadata';
import { DialogComponent } from '@pgr-cla/core-ui-components';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { HelpTextIconComponent } from '../../help-text-icon/help-text-icon.component';
import { MatButtonModule } from '@angular/material/button';
import { DialogSubtitleComponent } from "../../layout/dialog-subtitle/dialog-subtitle.component";

export const INFO_DIALOG_CONTENT = new InjectionToken<string>('app.infoDiag.content');

@Component({
    selector: 'tmx-information-dialog',
    templateUrl: './information-dialog.component.html',
    styleUrls: ['./information-dialog.component.scss'],
    imports: [
    CommonModule,
    DialogComponent,
    NgComponentOutlet,
    HelpTextIconComponent,
    MatDialogModule,
    MatButtonModule,
    DialogSubtitleComponent
],
})
export class InformationDialogComponent {
    contentInjector: Injector;
	subtitleContentInjector: Injector;

    public data = inject<{
        confirmText: string;
        cancelText: string;
        component: Type<unknown>;
        componentData: unknown;
		subtitleComponent: Type<unknown>;
		subtitleComponentData: unknown;
        title: string;
        subtitle: string;
        hideCancelButton: boolean;
        helpKey: string | HelpText;
        dialogContentClass?: string | string[] | null;
    }>(MAT_DIALOG_DATA, { optional: true });
    private dialogRef = inject(MatDialogRef<InformationDialogComponent>);
    public injector = inject(Injector);

    constructor() {
        this.contentInjector = Injector.create({
            providers: [{ provide: INFO_DIALOG_CONTENT, useValue: this.data.componentData }],
            parent: this.injector,
        });

		this.subtitleContentInjector = Injector.create({
			providers: [{ provide: INFO_DIALOG_CONTENT, useValue: this.data.subtitleComponentData }],
			parent: this.injector,
		});
    }

    shouldDisplaySubtitle(): boolean {
        return this.data.subtitle || this.data.subtitleComponent ? true : false;
    }

	hasInjectedSubtitleComponent(): boolean {
		return this.data.subtitleComponent ? true : false;
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

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.close();
    }
}
