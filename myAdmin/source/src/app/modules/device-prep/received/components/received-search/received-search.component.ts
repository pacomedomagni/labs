import { Component, EventEmitter, Output } from "@angular/core";

@Component({
    selector: "tmx-device-prep-received-search",
    templateUrl: "./received-search.component.html",
    styleUrls: ["./received-search.component.scss"],
    standalone: false
})
export class ReceivedSearchComponent {

	constructor() { }

	@Output() checkinQuery: EventEmitter<string> = new EventEmitter();
	@Output() deviceQuery: EventEmitter<string> = new EventEmitter();

	performCheckin(query: string): void {
		this.checkinQuery.emit(query);
	}

	performSearch(serialNumber: string): void {
		this.deviceQuery.emit(serialNumber);
	}
}
