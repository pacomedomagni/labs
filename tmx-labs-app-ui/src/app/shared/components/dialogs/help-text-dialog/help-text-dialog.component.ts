import {
    Component,
    ComponentRef,
    HostListener,
    OnDestroy,
    OnInit,
    Type,
    ViewChild,
    ViewContainerRef,
    inject,
} from '@angular/core';
import {
    MatDialogRef,
    MatDialogContent,
    MatDialogTitle,
    MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { DialogComponent } from '@pgr-cla/core-ui-components';
import { HelpText } from '../../../help/metadata';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { DialogSubtitleComponent } from '../../layout/dialog-subtitle/dialog-subtitle.component';

@Component({
    selector: 'tmx-help-text-dialog',
    imports: [
        DialogComponent,
        NgClass,
        DialogSubtitleComponent,
        FormsModule,
        MatButtonModule,
        MatDialogTitle,
        MatDialogContent,
    ],
    templateUrl: './help-text-dialog.component.html',
    styleUrl: './help-text-dialog.component.scss',
})
export class HelpTextDialogComponent implements OnInit, OnDestroy {
    @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
    dynamicComponentContainer!: ViewContainerRef;

    private componentRef?: ComponentRef<unknown>;

    public data = inject<{
        cancelText: string;
        confirmText: string;
        message: string;
        title: string;
        subtitle: string;
        hideCancelButton: boolean;
        alignTextLeft: boolean;
        helpKey: string | HelpText;
        component?: Type<unknown>;
        componentData?: unknown;
    }>(MAT_DIALOG_DATA, { optional: true });
    private dialogRef = inject(MatDialogRef<HelpTextDialogComponent>);

    ngOnInit(): void {
        if (this.data.component) {
            this.loadDynamicComponent();
        }
    }

    ngOnDestroy(): void {
        if (this.componentRef) {
            this.componentRef.destroy();
        }
    }

    private loadDynamicComponent(): void {
        if (this.data.component && this.dynamicComponentContainer) {
            this.componentRef = this.dynamicComponentContainer.createComponent(this.data.component);

            // Pass data to the dynamic component if it has a 'data' property
            if (this.data.componentData && this.componentRef.instance) {
                Object.assign(this.componentRef.instance, this.data.componentData);
            }
        }
    }

    hasStringContent(): boolean {
        return !!this.data.message && !this.data.component;
    }

    hasDynamicComponent(): boolean {
        return !!this.data.component;
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

    private close(value?: boolean): void {
        this.dialogRef.close(value);
    }

    @HostListener('keydown.esc')
    public onEsc(): void {
        this.close();
    }
}
