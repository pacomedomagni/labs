import { Component } from "@angular/core";

import { fadeAnimation } from "@modules/shared/animations";
import { DevicePrepActivationQuery } from "../../stores/activation-query";

@Component({
    selector: "tmx-device-prep-device-activation-container",
    templateUrl: "./device-activation-container.component.html",
    styleUrls: ["./device-activation-container.component.scss"],
    animations: [fadeAnimation],
    standalone: false
})
export class DeviceActivationContainerComponent {

	constructor(public query: DevicePrepActivationQuery) { }
}
