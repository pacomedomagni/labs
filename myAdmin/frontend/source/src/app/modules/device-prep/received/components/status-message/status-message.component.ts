import { Component, Input } from "@angular/core";

@Component({
    selector: "tmx-device-prep-status-message",
    templateUrl: "./status-message.component.html",
    styleUrls: ["./status-message.component.scss"],
    standalone: false
})
export class StatusMessageComponent {

	@Input() message: string;

	constructor() { }

}
