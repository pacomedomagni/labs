import { MessageCode, OrderType } from "./enums";

export interface Resource {
    extenders: Map<string, unknown>[];
    messages: KeyValuePair<MessageCode, unknown>[];
}

export interface KeyValuePair<TKey, TValue> {
	key: TKey;
	value: TValue;
}

export interface UserInfo {
	isInOpsAdminRole: boolean;
	isInSupportAdminRole: boolean;
	isInOpsUserRole: boolean;
	isCommercialLineRole: boolean;
	hasEligibilityAccess: boolean;
	hasInsertInitialParticipationScoreInProcessAccess: boolean;
	hasOptOutSuspensionAccess: boolean;
	hasPolicyMergeAccess: boolean;
	hasResetEnrollmentAccess: boolean;
	hasStopShipmentAccess: boolean;
	hasUpdatePProGuidAccess: boolean;
	hasVehicleSupportAccess: boolean;
	isInAppChangeRole: boolean;
	isInMobileRegistrationAdminRole: boolean;
	isInTheftOnlyRole: boolean;
	isInTheftRole: boolean;
	isInFeeReversalRole: boolean;
	isInFeeReversalOnlyRole: boolean;
	lanId: string;
	name: string;
	// TMX Labs specific roles
	isLabsAdmin: boolean;
	isLabsUser: boolean;
}

export interface WebguardConfig {
    applicationName: string;
    applicationSubName: string;
    applicationEnvironmentName: string;
    allowedEnvironments: string[];
    accessConfigurationFile: string;
    logPath: string;
    logLevel: string;
    authenticationServiceUrl: string;
}

export interface WebguardClient {
    authenticationServiceUrl: string;
    modernAuthorizationServiceUrl: string;
    clientIdName: string;
    clientSecretName: string;
}

export interface ApiConfig {
    baseUrl: string;
    endpoints: Record<string, string>;
}

export interface ApiGatewayConfig extends ApiConfig {
    apiKey: string;
}

export interface ServicesConfig {
    claimsParticipantManagementApi: ApiConfig;
    commonApi: ApiConfig;
    deviceApi: ApiConfig;
    homebaseParticipantManagementApi: ApiConfig;
    tmxPolicyApi: ApiConfig;
    policyApi: ApiConfig;
    policyDeviceApi: ApiConfig;
    policyTripApi: ApiConfig;
    trialApi: ApiConfig;
    ubiApi: ApiConfig;
    floowApi: ApiConfig;
    policyServicingApi: ApiGatewayConfig;
    wcfServices: Record<string, string>;
}

export interface LoggingConfig {
    applicationName: string;
    applicationSubName: string;
    applicationSiteName: string;
    applicationEnvironmentName: string;
}

export interface ConnectionStringsConfig {
    configuration: string;
    support: string;
    homebase: string;
    policy: string;
    commercial: string;
    tripDetail: string;
}

export interface ApplicationConfig {
    applicationCode: number;
    serverCode: number;
    slotCode: number;
    configSectionCode: number;
    configKey: string;
    configValue: string;
    replacementConfigSectionCode: number | null;
    createDateTime: string; // ISO date string
    lastChangeDateTime: string; // ISO date string
    lastChangeUserId: string;
}

export interface Application {
    code: number;
    description: string;
    createDateTime: string; // ISO date string
    lastChangeDateTime: string; // ISO date string
    lastChangeUserId: string;
}

export interface Slot {
    code: number;
    description: string;
    createDateTime: string; // ISO date string
    lastChangeDateTime: string; // ISO date string
    lastChangeUserId: string;
}

export interface TMXServer {
    ubiServerSeqId: number;
    serverName: string;
    serverTypeCode: number;
    createDateTime: string; // ISO date string
}

export interface TimeSpan {
	days: number;
	hours: number;
	milliseconds: number;
	minutes: number;
	seconds: number;
	ticks: number;
	totalDays: number;
	totalHours: number;
	totalMilliseconds: number;
	totalMinutes: number;
	totalSeconds: number;
}

export interface Orders {
	searchOrderNumber: string;
	searchBeginDate: string;
	searchEndDate: string;
	type: OrderType;
	openSnapshotOrders: number;
	processedSnapshotOrders: number;
	snapshotDevicesNeeded: number;
	openCommercialLinesOrders: number;
	processedCommercialLinesOrders: number;
	commercialLinesDevicesNeeded: number;
}

export interface StateOrder {
	state: string;
	numberOfOrders: number;
	numberOfDevices: number;
	numberOfOldOrders: number;
	oldestOrder: Date;
	numberDaysForOldOrders: number;
}

export interface OrderSearch {
	type: OrderType;
	orderId: string;
}

export interface OrdersByState {
	type: OrderType;
	stateOrders: StateOrder[];
}

export interface OrderDetails {
	orderId: string;
	orderNumber: string;
	orderDate: Date;
	state: string;
	deviceCount: number;
	deviceType: string;
	status: string;
	vehicleInfo?: string;
	deviceVersion?: string;
	shippingDetails?: string;
}

export interface Resource {
    extenders: Map<string, unknown>[];
    messages: KeyValuePair<MessageCode, unknown>[];
}

export interface KeyValuePair<TKey, TValue> {
	key: TKey;
	value: TValue;
}