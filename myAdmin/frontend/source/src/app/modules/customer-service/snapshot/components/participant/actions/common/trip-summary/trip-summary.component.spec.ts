import { TimeSpan, TripSummary, TripSummaryDaily, TripSummaryDistractedDriving } from "@modules/shared/data/resources";
import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { TripSummaryComponent } from "./trip-summary.component";

function setup() {
	const injectedData = {
		trips: [
			createTripSummary(1, 3, 5, 7, 9,
				{ hours: 2, minutes: 30, seconds: 15, totalHours: 2.5, totalSeconds: 9015 } as TimeSpan,
				{ applicationUsageHandsFree: 10, applicationUsageInHand: 10, phoneUsageHandsFree: 10, phoneUsageInHand: 10 } as TripSummaryDistractedDriving),
			createTripSummary(2, 4, 6, 8, 10,
				{ hours: 4, minutes: 15, seconds: 45, totalHours: 4.25, totalSeconds: 15345 } as TimeSpan,
				{ applicationUsageHandsFree: 10, applicationUsageInHand: 10, phoneUsageHandsFree: 10, phoneUsageInHand: 10 } as TripSummaryDistractedDriving),
			createTripSummary(3, 6, 9, 12, 15, { hours: 6, minutes: 45, seconds: 5, totalHours: 6.75, totalSeconds: 24305 } as TimeSpan,
				{ applicationUsageHandsFree: 10, applicationUsageInHand: 10, phoneUsageHandsFree: 10, phoneUsageInHand: 10 } as TripSummaryDistractedDriving)
		] as TripSummaryDaily[]
	} as TripSummary;
	const query = autoSpy(ResourceQuery);
	query.getExtender.mockReturnValue(1);

	const builder = {
		injectedData,
		default() {
			return builder;
		},
		build() {
			const component = new TripSummaryComponent(injectedData, query);
			component.tripSummary = injectedData;
			return component;
		}
	};

	return builder;
}

function createTripSummary(
	tripCount: number,
	hardAccelerations: number,
	hardBrakes: number,
	highRiskSeconds: number,
	mileage: number,
	duration: TimeSpan,
	distractedDrivingInfo: TripSummaryDistractedDriving
): TripSummaryDaily {
	return {
		duration,
		tripCount,
		hardAccelerations,
		hardBrakes,
		highRiskSeconds,
		mileage,
		distractedDrivingInfo
	} as TripSummaryDaily;
}

describe("TripSummaryComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
		expect(component.columns).toEqual(["date", "trips", "duration", "mileage", "hardBrakes"]);
	});

	it("should get total trip count", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalTripCount();

		expect(result).toEqual(6);
	});

	it("should get trip duration display", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTripDurationDisplay(component.tripSummary.trips[0]);

		expect(result).toEqual("02:30:15");
	});

	it("should get total trip duraction", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalTripDuration();

		expect(result).toEqual(13.5);
	});

	it("should get total trip mileage", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalTripMileage();

		expect(result).toEqual(34);
	});

	it("should get total hard brakes", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalHardBrakes();

		expect(result).toEqual(20);
	});

	it("should get total hard accels", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalHardAccels();

		expect(result).toEqual(13);
	});

	it("should get total hrs", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalHighRiskSeconds();

		expect(result).toEqual(27);
	});

	it("should get total hard brakes per 100", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getHardBrakesPer100();

		expect(result).toEqual(58.8235294117647);
	});

	it("should get annualized value", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.annualizeValue(5);

		expect(result).toEqual(1825);
	});

	it("should get total app hands free", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalAppHandsFree();

		expect(result).toEqual(30);
	});

	it("should get total app in hand", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalAppInHand();

		expect(result).toEqual(30);
	});

	it("should get total phone hands free", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalPhoneHandsFree();

		expect(result).toEqual(30);
	});

	it("should get total phone in hand", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalPhoneInHand();

		expect(result).toEqual(30);
	});

	it("should get app and phone usage as a percentage of total time", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getAppAndPhoneUsageAsPercentageOfTotalTime();

		expect(result).toEqual((((120 / 60) / 60) / 13.5) * 100);
	});

});
