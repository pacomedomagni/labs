
import { MobileContext } from "@modules/shared/data/resources";

import { ResourceQuery } from "@modules/shared/stores/resource-query";
import { autoSpy } from "autoSpy";
import { MobileConnectivityComponent } from "./mobile-connectivity.component";

function setup() {

	const injectedData = [

		{ mobileDeviceContextOffSetDateTime: new Date("2021-06-01 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
		{ mobileDeviceContextOffSetDateTime: new Date("2021-05-31 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
		{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:38.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
		{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
		{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 2, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
		{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 2, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
		{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 3, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext

	] as MobileContext[];
	const query = autoSpy(ResourceQuery);
	query.getExtender.mockReturnValue(1);

	const builder = {
		injectedData,
		default() {
			return builder;
		},
		build() {
			const component = new MobileConnectivityComponent(injectedData, query);
			component.mobileConexts = injectedData;
			return component;
		}
	};

	return builder;
}

describe("MobileConnectivityComponent", () => {

	it("should create", () => {
		const { build } = setup().default();
		const component = build();

		expect(component).toBeTruthy();
		expect(component.displayedColumns).toEqual(["mobileDeviceContextOffSetDateTime", "backgroundAppRefreshInd", "gpsLocationServicesInd", "pushEnabledInd", "lowPowerModeInd", "batteryLevelAmt", "gapText"]);
		expect(component.displayedHeaderColumns).toEqual(["mobileDeviceContextOffSetDateTime", "backgroundAppRefreshInd", "gpsLocationServicesInd", "pushEnabledInd", "lowPowerModeInd", "batteryLevelAmt"]);
		expect(component.displayedFooterColumns).toEqual(["paginationHolder"]);
	});

	it("should get total location services", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalLocationServices();

		expect(result).toEqual(0.2857142857142857);
	});

	it("should get total background refresh", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalBackgroundAppRefresh();

		expect(result).toEqual(1);
	});

	it("should get total lower power mode", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalLowPowerMode();

		expect(result).toEqual(1);
	});

	it("should get total push notifications", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.getTotalPushNotifications();

		expect(result).toEqual(0);
	});

	it("should convert milliseconds", () => {
		const { build } = setup().default();
		const component = build();

		const result = component.convertMillisecondsToDurationText(3600232454);

		expect(result).toEqual(" 41 days, 16 hours, 3 minutes, 52 seconds");
	});

	it("should reverse sort by date", () => {
		const { build } = setup().default();
		const component = build();

		const reverseMobileContexts = [
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:38.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-31 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-06-01 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext
		] as MobileContext[];

		const expectedMobileContexts = [
			{ mobileDeviceContextOffSetDateTime: new Date("2021-06-01 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-31 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:38.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext

		] as MobileContext[];

		const result = component.sortByDate(reverseMobileContexts);

		expect(result).toEqual(expectedMobileContexts);
	});

	it("should ngOnInit", () => {
		const { build } = setup().default();
		const component = build();

		const randomMobileContexts = [
			{ mobileDeviceContextOffSetDateTime: new Date("2021-07-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:38.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-31 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-06-01 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext
		] as MobileContext[];

		component.mobileConexts = randomMobileContexts;

		const expectedMobileContexts = [
			{ mobileDeviceContextOffSetDateTime: new Date("2021-07-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: undefined, backgroundAppRefreshInd: undefined, gpsLocationServicesInd: undefined, pushEnabledInd: undefined, lowPowerModeInd: undefined, batteryLevelAmt: undefined, gapText: "LARGE TIME GAP – 59 days, 0 hour, 0 minute, 0 second" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-06-01 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-31 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 1, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:38.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext,
			{ mobileDeviceContextOffSetDateTime: new Date("2021-05-30 13:15:28.530"), backgroundAppRefreshInd: 1, gpsLocationServicesInd: 0, pushEnabledInd: -1, lowPowerModeInd: 1, batteryLevelAmt: 0.34, gapText: "" } as MobileContext

		] as MobileContext[];

		component.ngOnInit();

		expect(component.displayMobileConexts).toEqual(expectedMobileContexts);
	});

});
