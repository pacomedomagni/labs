import { AfterViewInit, Component, Inject, Input, OnInit, Optional, ViewChild } from "@angular/core";
import { MobileContext } from "@modules/shared/data/resources";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { MatPaginator } from "@angular/material/paginator";

@Component({
    selector: "tmx-snapshot-mobile-connectivity",
    templateUrl: "./mobile-connectivity.component.html",
    styleUrls: ["./mobile-connectivity.component.scss"],
    standalone: false
})
export class MobileConnectivityComponent implements OnInit, AfterViewInit {

	@Input() mobileConexts: MobileContext[];
	@ViewChild(MatPaginator) paginator: MatPaginator;
	displayMobileConexts: MobileContext[] = [];
	TOTAL_MILLISECONDS_IN_A_DAY = 86400000;

	dataSource: MatTableDataSource<MobileContext>;
	displayedColumns: string[] = ["mobileDeviceContextOffSetDateTime", "backgroundAppRefreshInd", "gpsLocationServicesInd", "pushEnabledInd", "lowPowerModeInd", "batteryLevelAmt", "gapText"];
	displayedHeaderColumns: string[] = ["mobileDeviceContextOffSetDateTime", "backgroundAppRefreshInd", "gpsLocationServicesInd", "pushEnabledInd", "lowPowerModeInd", "batteryLevelAmt"];
	displayedFooterColumns: string[] = ["paginationHolder"];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		public helper: ResourceQuery) { }

	ngOnInit(): void {
		this.mobileConexts = this.mobileConexts || this.injectedData;
		this.mobileConexts = this.sortByDate(this.mobileConexts);
		this.mobileConexts.forEach(
			(currentValue, index) => {

				if (index > 0) {

					const diff: number = Math.abs(this.mobileConexts[index - 1].mobileDeviceContextOffSetDateTime.getTime()
						- this.mobileConexts[index].mobileDeviceContextOffSetDateTime.getTime());
					if (diff > this.TOTAL_MILLISECONDS_IN_A_DAY) {

						this.displayMobileConexts.push({ gapText: "LARGE TIME GAP –" + this.convertMillisecondsToDurationText(diff) } as MobileContext);

					}
				}
				this.displayMobileConexts.push(currentValue);
			}
		);
		this.dataSource = new MatTableDataSource<MobileContext>(this.displayMobileConexts);
	}

	ngAfterViewInit(): void {
		this.dataSource.paginator = this.paginator;
	}

	private getTime(date?: Date): number {
		return date != null ? date.getTime() : 0;
	}

	public sortByDate(array: MobileContext[]): MobileContext[] {
		return array.sort((a: MobileContext, b: MobileContext) => this.getTime(b.mobileDeviceContextOffSetDateTime) - this.getTime(a.mobileDeviceContextOffSetDateTime));
	}

	convertMillisecondsToDurationText(milliSeconds: number): string {
		const days = Math.floor(milliSeconds / (86400 * 1000));

		milliSeconds -= days * (86400 * 1000);
		const hours = Math.floor(milliSeconds / (60 * 60 * 1000));

		milliSeconds -= hours * (60 * 60 * 1000);
		const minutes = Math.floor(milliSeconds / (60 * 1000));
		milliSeconds -= minutes * (60 * 1000);
		const seconds = Math.floor(milliSeconds / 1000);

		return " " + (days > 0 ? (days + " day" + (days > 1 ? "s, " : ", ")) : " ")
			+ ((hours > 0 || days > 0) ? (hours + " hour" + (hours > 1 ? "s, " : ", ")) : " ")
			+ ((minutes > 0 || hours > 0 || days > 0) ? (minutes + " minute" + ((minutes > 1) ? "s, " : ", ")) : " ")
			+ ((seconds > 0 || hours > 0 || days > 0 || minutes > 0) ? (seconds + " second" + ((seconds > 1) ? "s" : "")) : "");
	}

	getTotalLocationServices(): number {
		const filteredMobileContext = this.mobileConexts.map(t => t.gpsLocationServicesInd);
		return filteredMobileContext.filter(x => x === 1).length
			/ (filteredMobileContext.length === 0 ? 1 : filteredMobileContext.length);
	}

	getTotalBackgroundAppRefresh(): number {
		const filteredMobileContext = this.mobileConexts.map(t => t.backgroundAppRefreshInd).filter(x => x === 1 || x === 0);
		return filteredMobileContext.reduce((acc, value) => acc + value, 0)
			/ (filteredMobileContext.length === 0 ? 1 : filteredMobileContext.length);
	}

	getTotalPushNotifications(): number {
		const filteredMobileContext = this.mobileConexts.map(t => t.pushEnabledInd).filter(x => x === 1 || x === 0);
		return filteredMobileContext.reduce((acc, value) => acc + value, 0)
			/ (filteredMobileContext.length === 0 ? 1 : filteredMobileContext.length);
	}

	getTotalLowPowerMode(): number {
		const filteredMobileContext = this.mobileConexts.map(t => t.lowPowerModeInd).filter(x => x === 1 || x === 0);
		return filteredMobileContext.reduce((acc, value) => acc + value, 0)
			/ (filteredMobileContext.length === 0 ? 1 : filteredMobileContext.length);
	}
}
