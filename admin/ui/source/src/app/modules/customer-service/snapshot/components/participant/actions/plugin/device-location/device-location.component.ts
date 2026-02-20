import { AfterViewInit, Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { DeviceLocationInfo } from "@modules/shared/data/resources";
import { UIFormats } from "@modules/shared/data/ui-format";
import { GoogleMapsService } from "@modules/shared/services/_index";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { HelpText } from "@modules/customer-service/shared/help/metadata";

@UntilDestroy()
@Component({
    selector: "tmx-snapshot-device-location",
    templateUrl: "./device-location.component.html",
    styleUrls: ["./device-location.component.scss"],
    standalone: false
})
export class DeviceLocationComponent implements OnInit, AfterViewInit {

	@Input() data: DeviceLocationInfo[];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	isLegacyDevice: boolean = false;
	columns: string[] = ["date", "lat", "long", "arrow"];
	dataSource: MatTableDataSource<DeviceLocationInfo>;
	location: google.maps.LatLngLiteral;
	options: google.maps.MapOptions;
	markerTitle: string;
	formats = UIFormats;
	selectedIndex = 0;
	helpText = HelpText;

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any, public googleMapsService: GoogleMapsService) { }

	ngOnInit(): void {
		this.data = this.data || this.injectedData.x;
		this.isLegacyDevice = this.injectedData.isLegacyDevice;
		this.dataSource = new MatTableDataSource<DeviceLocationInfo>(this.data);
	}

	ngAfterViewInit(): void {
		this.dataSource.paginator = this.paginator;
		this.googleMapsService.isApiLoaded$.pipe(untilDestroyed(this)).subscribe(x => {
			if (this.data.length > 0) {
				this.location = { lat: this.data[0].latitude, lng: this.data[0].longitude };
			}
			this.options = { center: this.location };
			this.markerTitle = `Lat: ${this.location?.lat} Lng: ${this.location?.lng}`;
		});
	}

	setCoordinates(lat: number, lng: number, index: number): void {
		this.location = { lat, lng };
		this.options = { center: this.location };
		this.selectedIndex = index;
	}

}
