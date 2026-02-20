import { CommonModule, DatePipe } from "@angular/common";
import { CoreUiModule } from "@pgr-cla/core-ui-components";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { CookieService } from "ngx-cookie-service";
import { BreadcrumbModule } from "xng-breadcrumb";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { AppDataService, DialogService } from "./services/_index";

import {
	AppHeaderComponent,
	ConfirmationDialogComponent,
	DataListComponent,
	DataListRowComponent,
	DateTimeControlComponent,
	EmptyStateComponent,
	FormDialogComponent,
	HelpTextComponent,
	InformationDialogComponent,
	NavRailComponent,
	PageHeaderComponent,
	PolicyHeaderComponent,
	PolicySearchComponent,
	SideNavBarComponent,
	SideNavContainerComponent,
	SpinnerComponent,
	WrapperComponent,
	FilterSortPaginatorComponent,
	TimeControlComponent,
	DateTimeModalComponent
} from "./components/_index";
import { AuthGuard, ExternalRedirectGuard } from "./guards/_index";
import {
	KmToMilesPipe,
	DurationPipe,
	DynamicPipe,
	NullCoalescePipe,
	PhoneNumberPipe,
	YesNoPipe,
	ActiveInactivePipe,
	EnumTranslationPipe,
	PascalCasingSpacingPipe
} from "./pipes/_index";

import { MaxDirective, MinDirective } from "./directives/validators";
import { FocusDirective } from "./directives/focus.directive";
import { MaterialModule } from "./material.module";
import { ResizeColumnDirective } from "./directives/table-colum-resize.directive";
import { ResourceQuery } from "./stores/resource-query";
import { ScrollRetainerDirective } from "./directives/scroll-retainer.directive";
import { ModalSpinnerDirective } from "./directives/modal-spinner.directive";
import { PhoneNumberFormatDirective } from "./directives/phone-number-format.directive";
import { GuidFormatDirective }  from "./directives/guid-format.directive";
import {
	BaseControlComponent,
	DateControlComponent,
	GuidControlComponent,
	NumericControlComponent,
	PhoneNumberControlComponent,
	SelectControlComponent,
	TextControlComponent
} from "./components/form-controls/_index";

@NgModule({
	imports: [
		CommonModule,
		CoreUiModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		MatTableModule,
		RouterModule,
		BreadcrumbModule
	],
	declarations: [
		AppHeaderComponent,
		DataListComponent,
		DataListRowComponent,
		DateTimeControlComponent,
		DynamicPipe,
		DurationPipe,
		KmToMilesPipe,
		EmptyStateComponent,
		FocusDirective,
		ScrollRetainerDirective,
		PhoneNumberFormatDirective,
		GuidFormatDirective,
		PageHeaderComponent,
		PhoneNumberPipe,
		MinDirective,
		MaxDirective,
		NavRailComponent,
		NullCoalescePipe,
		SideNavBarComponent,
		SideNavContainerComponent,
		WrapperComponent,
		SpinnerComponent,
		PolicyHeaderComponent,
		PolicySearchComponent,
		ResizeColumnDirective,
		ConfirmationDialogComponent,
		InformationDialogComponent,
		FormDialogComponent,
		HelpTextComponent,
		ModalSpinnerDirective,
		YesNoPipe,
		DateControlComponent,
		BaseControlComponent,
		TextControlComponent,
		GuidControlComponent,
		FilterSortPaginatorComponent,
		PhoneNumberControlComponent,
		NumericControlComponent,
		SelectControlComponent,
		ActiveInactivePipe,
		PascalCasingSpacingPipe,
		EnumTranslationPipe,
		TimeControlComponent,
		DateTimeModalComponent
	],
	exports: [
		AppHeaderComponent,
		ConfirmationDialogComponent,
		CoreUiModule,
		DataListComponent,
		DataListRowComponent,
		DateTimeControlComponent,
		DynamicPipe,
		DurationPipe,
		KmToMilesPipe,
		EmptyStateComponent,
		FocusDirective,
		PhoneNumberFormatDirective,
		GuidFormatDirective,
		FormsModule,
		FormDialogComponent,
		HelpTextComponent,
		InformationDialogComponent,
		MaterialModule,
		MatTableModule,
		MatPaginator,
		MatSort,
		MinDirective,
		MaxDirective,
		ScrollRetainerDirective,
		NavRailComponent,
		NullCoalescePipe,
		PageHeaderComponent,
		PhoneNumberPipe,
		PolicyHeaderComponent,
		FilterSortPaginatorComponent,
		PolicySearchComponent,
		ResizeColumnDirective,
		ReactiveFormsModule,
		SideNavContainerComponent,
		WrapperComponent,
		SpinnerComponent,
		ModalSpinnerDirective,
		YesNoPipe,
		BreadcrumbModule,
		DateControlComponent,
		BaseControlComponent,
		TextControlComponent,
		GuidControlComponent,
		PhoneNumberControlComponent,
		NumericControlComponent,
		SelectControlComponent,
		ActiveInactivePipe,
		PascalCasingSpacingPipe,
		EnumTranslationPipe,
		TimeControlComponent,
		DateTimeModalComponent
	],
	providers: [
		AuthGuard,
		ExternalRedirectGuard,
		DatePipe,
		DurationPipe,
		KmToMilesPipe,
		AppDataService,
		CookieService,
		DialogService,
		PhoneNumberPipe,
		ResourceQuery,
		MatPaginator,
		MatSort,
	]
})
export class SharedModule { }
