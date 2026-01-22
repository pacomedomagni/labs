import { HelpTextData } from '../../data/application/help-text/applications-help-text';
import { Type } from '@angular/core';

export interface DialogOptions {
    title: string;
    subtitle?: string;
    message?: string;
    width?: string;
    maxWidth?: string;
    height?: string;
    maxHeight?: string;
    confirmText?: string;
    cancelText?: string;
    hideCancelButton?: boolean;
    alignTextLeft?: boolean;
    helpKey?: string;
}

export interface HelpTextDialogOptions {
    data: HelpTextData;
    component?: Type<unknown>; // Add optional component
    componentData?: unknown; // Add optional component data
}

export interface InformationDialogOptions<T, T2 = never> extends DialogOptions {
    component: T;
    componentData?: unknown;
    subtitleComponent?: T2;
    subtitleComponentData?: unknown;
    dialogContentClass?: string | string[] | null;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TableDialogOptions<T, T2 = never> extends InformationDialogOptions<T, T2> {
    // Expected to be extended in the future
}

export interface FormDialogOptions<T> extends DialogOptions {
    component: T;
    componentData?: unknown;
    formModel: unknown;
    manualSubmission?: boolean;
}
