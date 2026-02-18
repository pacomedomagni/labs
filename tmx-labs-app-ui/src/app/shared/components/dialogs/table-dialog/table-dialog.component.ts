import { Component, HostListener, InjectionToken, Injector, Type, inject, ViewChild, AfterViewInit, WritableSignal, signal, computed } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HelpText } from '../../../help/metadata';
import { DialogComponent } from '@pgr-cla/core-ui-components';
import { CommonModule, NgComponentOutlet } from '@angular/common';
import { HelpTextIconComponent } from '../../help-text-icon/help-text-icon.component';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginator, MatPaginatorModule } from "@angular/material/paginator";
import { DialogSubtitleComponent } from "../../layout/dialog-subtitle/dialog-subtitle.component";

export const TABLE_DIALOG_CONTENT = new InjectionToken<string>('app.tableDiag.content');
export const TABLE_DIALOG_PAGINATOR = new InjectionToken<MatPaginator>('app.tableDiag.paginator');
export const TABLE_DIALOG_SHOW_PAGINATOR = new InjectionToken<WritableSignal<boolean>>('app.tableDiag.showPaginator');
export const TABLE_DIALOG_CONFIRM_DISABLED = new InjectionToken<WritableSignal<boolean>>('app.tableDiag.confirmDisabled');

@Component({
    selector: 'tmx-table-dialog',
    templateUrl: './table-dialog.component.html',
    styleUrls: ['./table-dialog.component.scss'],
    imports: [
    CommonModule,
    DialogComponent,
    NgComponentOutlet,
    HelpTextIconComponent,
    MatDialogModule,
    MatButtonModule,
    MatPaginatorModule,
    DialogSubtitleComponent
],
})
export class TableDialogComponent implements AfterViewInit {
    @ViewChild(MatPaginator, { static: false }) paginator?: MatPaginator;

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
    private dialogRef = inject(MatDialogRef<TableDialogComponent>);
    public injector = inject(Injector);

    childShowPaginator = signal<boolean>(true);
    childConfirmDisabled = signal<boolean>(false);

    constructor() {
        // Initial injector with showPaginator signal that child can provide
        this.contentInjector = Injector.create({
            providers: [
                { provide: TABLE_DIALOG_CONTENT, useValue: this.data.componentData },
                { provide: TABLE_DIALOG_SHOW_PAGINATOR, useValue: this.childShowPaginator },
                { provide: TABLE_DIALOG_CONFIRM_DISABLED, useValue: this.childConfirmDisabled }
            ],
            parent: this.injector,
        });

		this.subtitleContentInjector = Injector.create({
			providers: [
                { provide: TABLE_DIALOG_CONTENT, useValue: this.data.subtitleComponentData }
            ],
			parent: this.injector,
		});
    }

    ngAfterViewInit(): void {
        // Update the injector with paginator reference after view init
        if (this.paginator) {
            this.contentInjector = Injector.create({
                providers: [
                    { provide: TABLE_DIALOG_CONTENT, useValue: this.data.componentData },
                    { provide: TABLE_DIALOG_PAGINATOR, useValue: this.paginator },
                    { provide: TABLE_DIALOG_SHOW_PAGINATOR, useValue: this.childShowPaginator },
                    { provide: TABLE_DIALOG_CONFIRM_DISABLED, useValue: this.childConfirmDisabled }
                ],
                parent: this.injector,
            });
        }
    }

    shouldDisplaySubtitle(): boolean {
        return this.data.subtitle || this.data.subtitleComponent ? true : false;
    }

	shouldShowPaginator = computed(() => {
        return this.childShowPaginator() ?? false;
    });

    shouldDisableConfirm = computed(() => {
        return this.childConfirmDisabled() ?? false;
    });

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
        if (this.childConfirmDisabled()) {
            return;
        }
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
