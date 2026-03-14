import { Component, OnInit } from "@angular/core";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

import { BehaviorSubject } from "rxjs";
import { NotificationService } from "@pgr-cla/core-ui-components";
import { fadeAnimation } from "@modules/shared/animations";
import { take } from "rxjs/operators";
import { DeviceReceivedService } from "../../services/device-received.service";
import { DevicePrepReceivedQuery } from "../../stores/received-query";

@UntilDestroy()
@Component({
    selector: "tmx-device-prep-device-received-container",
    templateUrl: "./device-received-container.component.html",
    styleUrls: ["./device-received-container.component.scss"],
    animations: [fadeAnimation],
    standalone: false
})
export class DeviceReceivedContainerComponent implements OnInit {

	statusMessage: BehaviorSubject<string> = new BehaviorSubject<string>(undefined);
	searchError: string;

	constructor(
		public query: DevicePrepReceivedQuery,
		private notificationService: NotificationService,
		private service: DeviceReceivedService) { }

	ngOnInit(): void {
		this.service.getInProcessLots().pipe(take(1)).subscribe();
		this.query.searchError$.pipe(untilDestroyed(this)).subscribe(x => {
			this.searchError = x;
		});
	}

	performCheckin(query: string): void {
		this.statusMessage.next(undefined);
		this.service.checkin(query).subscribe(x => {
			this.updateMessage("checkin complete");
		});
	}

	performSearch(serialNumber: string): void {
		this.statusMessage.next(undefined);
		this.service.findLot(serialNumber).subscribe(x => {
			this.updateMessage(`Device ${serialNumber} belongs to manufacturer lot ${x.name}`);
		});
	}

	private updateMessage(successMessage: string): void {
		if (this.searchError !== undefined) {
			this.notificationService.error(this.searchError);
			this.statusMessage.next(undefined);
		}
		else {
			this.statusMessage.next(successMessage);
		}
	}

}
