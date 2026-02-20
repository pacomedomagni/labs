import { Component, EventEmitter, Input, Output } from "@angular/core";
import { fadeAnimation } from "@modules/shared/animations";

@Component({
    selector: "tmx-policy-search",
    templateUrl: "./policy-search.component.html",
    styleUrls: ["./policy-search.component.scss"],
    animations: [fadeAnimation],
    standalone: false
})
export class PolicySearchComponent {

	@Input() showPolicySearch: boolean;
	@Input() showSerialNumberSearch: boolean;
	@Input() showPhoneNumberSearch: boolean;
	@Input() showMobileIdentifierSearch: boolean;

	@Input() showEmptyDataPanel: boolean;
	@Input() showSearchErrorPanel: boolean;
	@Input() searchErrorMessage: string;

	@Output() policySearch = new EventEmitter<string>();
	@Output() serialNumberSearch = new EventEmitter<string>();
	@Output() phoneNumberSearch = new EventEmitter<string>();
	@Output() mobileIdentifierSearch = new EventEmitter<string>();

	policyNumber: string;
	serialNumber: string;
	phoneNumber: string;
	mobileIdentifier: string;

	private inputs: string[] = ["policyNumber", "serialNumber", "phoneNumber", "mobileIdentifier"];

	constructor() { }

	onPolicySearch(policyNumber: string): void {
		if (policyNumber?.length > 0) {
			this.policySearch.emit(policyNumber);
		}
	}

	onSerialNumberSearch(serialNumber: string): void {
		if (serialNumber?.length > 0) {
			this.serialNumberSearch.emit(serialNumber);
		}
	}

	onMobileIdentifierSearch(mobileIdentifier: string): void {
		if (mobileIdentifier?.length > 0) {
			this.mobileIdentifierSearch.emit(mobileIdentifier);
		}
	}

	onPhoneNumberSearch(phoneNumber: string): void {
		if (phoneNumber?.length === 14) {
			phoneNumber = phoneNumber.replace(/\D/g, "");
			this.phoneNumberSearch.emit(phoneNumber);
		}
	}

	clearInputs(input: string): void {
		this.inputs.forEach(x => {
			if (this[x] !== input) {
				this[x] = undefined;
			}
		});
	}

}
