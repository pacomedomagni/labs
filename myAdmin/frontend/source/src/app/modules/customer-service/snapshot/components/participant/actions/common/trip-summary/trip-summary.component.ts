import { Component, Inject, Input, OnInit, Optional } from "@angular/core";
import { ScoringAlgorithmData, TripSummary, TripSummaryDaily } from "@modules/shared/data/resources";
import { MatTableDataSource } from "@angular/material/table";
import { INFO_DIALOG_CONTENT } from "@modules/shared/components/dialogs/information-dialog/information-dialog.component";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { getTripDurationDisplay } from "@modules/shared/utils/datetime-utils";

@Component({
    selector: "tmx-snapshot-trip-summary",
    templateUrl: "./trip-summary.component.html",
    styleUrls: ["./trip-summary.component.scss"],
    standalone: false
})
export class TripSummaryComponent implements OnInit {

	@Input() tripSummary: TripSummary;
	@Input() algorithmData: ScoringAlgorithmData;
	@Input() isMobile: boolean;

	dataSource: MatTableDataSource<TripSummaryDaily>;
	columns: string[] = ["date", "trips", "duration", "mileage", "hardBrakes"];

	constructor(
		@Optional() @Inject(INFO_DIALOG_CONTENT) public injectedData: any,
		public helper: ResourceQuery) { }

	ngOnInit(): void {
		this.tripSummary = this.tripSummary || this.injectedData.data;
		this.algorithmData = this.algorithmData || this.injectedData.algorithm;
		this.isMobile = this.isMobile || this.injectedData.isMobile;
		this.dataSource = new MatTableDataSource<TripSummaryDaily>(this.tripSummary?.trips);

		if (this.is2008Algorithm()) {
			this.columns.push("lowRisk", "medRisk", "highRisk");
		} else {
			this.columns.push("hardAccels", "hrs");
		}

		if (this.isMobile && this.is2018DDAlgorithmOrNewer()) {
			this.columns.push("ahf", "aih", "phf", "pih");
		}
	}

	is2008Algorithm(): boolean {
		return this.algorithmData.code === 1;
	}

	is2018DDAlgorithmOrNewer(): boolean {
		return this.algorithmData.code >= 5;
	}

	getTotalTripCount(): number {
		return this.sum(x => x.tripCount);
	}

	getTripDurationDisplay(trip: TripSummaryDaily): string {
		return getTripDurationDisplay(trip.duration);
	}

	getTotalTripDuration(): number {
		return this.sum(x => x.duration.totalHours);
	}

	getTotalTripMileage(): number {
		return this.sum(x => x.mileage);
	}

	getTotalHardBrakes(): number {
		return this.sum(x => x.hardBrakes);
	}

	getTotalHardAccels(): number {
		return this.sum(x => x.hardAccelerations);
	}

	getTotalHighRiskSeconds(): number {
		return this.sum(x => x.highRiskSeconds);
	}

	getTotalAppHandsFree(): number {
		return this.sum(x => x.distractedDrivingInfo?.applicationUsageHandsFree);
	}

	getTotalAppInHand(): number {
		return this.sum(x => x.distractedDrivingInfo?.applicationUsageInHand);
	}

	getTotalPhoneHandsFree(): number {
		return this.sum(x => x.distractedDrivingInfo?.phoneUsageHandsFree);
	}

	getTotalPhoneInHand(): number {
		return this.sum(x => x.distractedDrivingInfo?.phoneUsageInHand);
	}

	getHardBrakesPer100(): number {
		return this.getTotalHardBrakes() * 100 / this.getTotalTripMileage();
	}

	getAppAndPhoneUsageAsPercentageOfTotalTime(): number {
		const sum = this.getTotalAppHandsFree() + this.getTotalAppInHand() +
			this.getTotalPhoneHandsFree() + this.getTotalPhoneInHand();

		return (((sum / 60) / 60) / this.getTotalTripDuration()) * 100;
	}

	annualizeValue(value: number): number {
		const annualizedDays = this.helper.getExtender(this.tripSummary, "AnnualizedTotalDays");
		if (annualizedDays !== 0 && this.tripSummary.trips.some(x => x.duration.totalSeconds > 0)) {
			return value * 365 / annualizedDays;
		}
		else {
			return 0;
		}
	}

	formatSeconds(seconds: number): string {
		return new Date(seconds * 1000).toISOString().substr(11, 8);
	}

	private sum(callbackfn: (value: TripSummaryDaily) => number): number {
		const data = this.tripSummary.trips.map(callbackfn);
		return data[0] !== undefined ? data.reduce((total, current) => total + current, 0) : 0;
	}

}
