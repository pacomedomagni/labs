import { Component, Input, ViewChild } from "@angular/core";
import { NgModel } from "@angular/forms";

@Component({
    template: "",
    standalone: false
})
export class BaseControlComponent {

	@ViewChild(NgModel) ngModel: NgModel;

	@Input() id: string;
	@Input() name: string;
	@Input() label: string;
	@Input() isRequired: boolean;
	@Input() isDisabled: boolean;
	@Input() model: any;

	@ViewChild(NgModel) control: NgModel;

	constructor() { }

	hasError(): boolean {
		return this.control !== undefined && (this.control.invalid && (this.control.dirty || this.control.touched));
	}

	getErrorMessage(): string {
		return "Field is required";
	}
}
