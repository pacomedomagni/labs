import { Component } from "@angular/core";

import { DeviceActivationRequestType } from "@modules/shared/data/enums";
import { DeviceActivationService } from "../../services/device-activation.service";

@Component({
    selector: "tmx-device-prep-search-activation",
    templateUrl: "./search.component.html",
    styleUrls: ["./search.component.scss"],
    standalone: false
})
export class ActivationSearchComponent {

	query: string;

	constructor(private activationService: DeviceActivationService) { }

	getStatus(): void {
		this.performAction(DeviceActivationRequestType.Status);
	}

	activate(): void {
		this.performAction(DeviceActivationRequestType.Activate);
	}

	deactivate(): void {
		this.performAction(DeviceActivationRequestType.Deactivate);
	}

	private performAction(action: DeviceActivationRequestType): void {
		this.activationService.getDevices(this.query, action).subscribe(x => {

		});
	}
}
