import { Sort } from "@angular/material/sort";
import { PageEvent } from "@angular/material/paginator";
import * as Enums from "./enums";

export interface Resource {
	extenders: Map<string, any>[];
	messages: KeyValuePair<Enums.MessageCode, any>[];
}
export interface Address extends Resource {
	address1: string;
	address2: string;
	city: string;
	contactName: string;
	state: string;
	zipCode: string;
}
export interface AppInfo extends Resource {
	appName: string;
	assignmentExpirationDateTime: Date;
}
export interface AreParticipantDetails extends Resource {
	accidentResponseActivationDateTime: Date;
	accidentResponseConsentDateTime: Date;
	adActivated: boolean;
	adEnrolled: boolean;
	cadExperience: boolean;
	driverReferenceId: string;
	driverFirstName: string;
	enrollmentDateTime: Date;
	lastContactDateTime: Date;
	tmxMobileRegistered: boolean;
	ubiActivated: boolean;
	ubiEnrolled: boolean;
	unenrollmentDateTime: Date;
	unenrollReason: Enums.UnenrollReason;
}
export interface ArePolicyDetails extends Resource {
	experienceType: Enums.AreExperience;
}
export interface BillingTransaction extends Resource {
	amount: string;
	createDate: Date;
	description: string;
	deviceSeqId: number;
	deviceSerialNumber: string;
}
export interface Communication extends Resource {
	campaign: string;
	deviceSerialNumber: string;
	method: string;
	participantSeqId: number;
	processedDate: Date;
	reason: string;
}
export interface CompatibilityAction extends Resource {
	code: number;
	description: string;
	deviceExperienceTypeCode: Enums.DeviceExperience;
	isActive: boolean;
	orderByNumber: number;
}
export interface CompatibilityActionTaken extends Resource {
	actionTakenCode: number;
	actionTakenXRefSeqId: number;
	compatibilitySeqId: number;
	createDateTime: Date;
	lastChangeUserId: string;
}
export interface CompatibilityItem extends Resource {
	compatibilityActionTakenXRef: CompatibilityActionTaken[];
	compatibilitySeqId: number;
	compatibilityTypeCode: number;
	createDateTime: Date;
	detailedDescription: string;
	deviceExperienceTypeCode: Enums.DeviceExperience;
	deviceSerialNumber: string;
	emailAddress: string;
	lastChangeDateTime: Date;
	lastChangeUserId: string;
	mobileDeviceId: string;
	mobileDeviceModelName: string;
	mobileOSName: string;
	nonIssueFlag: boolean;
	participantSeqId: number;
	policyNumber: string;
	programCode: Enums.ProgramCode;
	vehicleMake: string;
	vehicleModel: string;
	vehicleModelYear: number;
}
export interface CompatibilityType extends Resource {
	code: number;
	description: string;
	deviceExperienceTypeCode: Enums.DeviceExperience;
	isActive: boolean;
	orderByNumber: number;
}
export interface ConnectionTimeline extends Resource {
	connectedDuration: TimeSpan;
	connectedDurationFormatted: string;
	disconnectedDuration: TimeSpan;
	disconnectedDurationFormatted: string;
	eventPairs: DisconnectionInterval[];
	isActiveParticipant: boolean;
	totalMonitoringDuration: TimeSpan;
	totalMonitoringDurationFormatted: string;
}
export interface DeviceFirmwareDetails {
	cellFirmwareFileName: string;
	cellFirmwareValue: string;
	configurationFirmwareFileName: string;
	configurationFirmwareValue: string;
	gpsFirmwareFileName: string;
	gpsFirmwareValue: string;
	mainFirmwareFileName: string;
	mainFirmwareValue: string;
	obd2FirmwareFileName: string;
	obd2FirmwareValue: string;
	targetCellFirmwareFileName: string;
	targetCellFirmwareValue: string;
	targetConfigurationFirmwareFileName: string;
	targetConfigurationFirmwareValue: string;
	targetGpsFirmwareFileName: string;
	targetGpsFirmwareValue: string;
	targetMainFirmwareFileName: string;
	targetMainFirmwareValue: string;
	targetObd2FirmwareFileName: string;
	targetObd2FirmwareValue: string;
}
export interface DeviceHistory extends Resource {
	recoveryInfo: DeviceRecoveryItem[];
	shippingInfo: DeviceShippingInformation[];
	suspensionInfo: DeviceSuspensionItem[];
}
export interface DeviceLocationInfo extends Resource {
	latitude: number;
	locationDate: Date;
	longitude: number;
}
export interface DeviceLot extends Resource {
	createDate: Date;
	name: string;
	seqId: number;
	status: Enums.DeviceLotStatus;
	type: Enums.DeviceLotType;
}
export interface DeviceRecoveryItem extends Resource {
	deviceReceivedDate: Date;
	deviceSeqId: number;
	deviceSerialNumber: string;
	isAbandoned: boolean;
	isSuspended: boolean;
	returnRequestDate: Date;
}
export interface DeviceShippingInformation {
	policyNumber: string;
	returnedDeviceCreateDate: Date;
	returnedDeviceReceivedDate: Date;
	shipDateTime: Date;
}
export interface DeviceSuspensionItem extends Resource {
	daysSuspended: string;
	deviceSerialNumber: string;
	startDate: Date;
	userName: string;
}
export interface DisconnectionInterval extends Resource {
	connection: Date;
	disconnection: Date;
	disconnectionDuration: string;
}
export interface Driver extends Resource {
	externalId: string;
	firstName: string;
	lastName: string;
	seqId: number;
}
export interface ExcludedDateRange extends Resource {
	description: string;
	excludedDateRangeReasonCode: number;
	lastChangeDateTime: Date;
	modByUserId: string;
	rangeEnd: Date;
	rangeStart: Date;
}
export interface ExcludedDateRangeReasonCode extends Resource {
	code: number;
	description: string;
	isActive: boolean;
}
export interface InitialParticipantScoreInProcess extends Resource {
	beginScoreCheckDate: Date;
	createDate: Date;
	endorsementAppliedDate: Date;
	enrollmentDate: Date;
	isEmailSent: boolean;
	isEndorsementDiscountZero: boolean;
	isScoreCalculated: boolean;
	lastUpdateDate: Date;
	participantSeqId: number;
}
export interface MobileContext extends Resource {
	backgroundAppRefreshInd: number;
	batteryLevelAmt: number;
	gapText: string;
	gpsLocationServicesInd: number;
	lowPowerModeInd: number;
	mobileDeviceContextOffSetDateTime: Date;
	pushEnabledInd: number;
}
export interface MobileDevice extends Resource {
	createDateTime: Date;
	deviceIdentifier: string;
	deviceSeqId: number;
	firstContactDateTime: Date;
	homeBaseDeviceSeqId: number;
	isRegisteredInd: boolean;
	lastChangeDateTime: Date;
	lastContactDateTime: Date;
	lastUploadDateTime: Date;
	mobileAppConfigId: number;
	mobileAppVersionName: string;
	mobileDeviceAliasName: string;
	mobileDeviceModelName: string;
	mobileOSName: string;
	mobileOSVersionName: string;
}
export interface OptOutData extends Resource {
	date: Date;
	reason: Enums.OptOutReasonCode;
	reasonDescription: string;
}
export interface OptOutSuspension extends Resource {
	deviceSeqId: number;
	deviceSerialNumber: string;
	endDate: Date;
	isCancelled: boolean;
	isReturned: boolean;
	reasonCode: Enums.OptOutReasonCode;
	seqId: number;
	startDate: Date;
	userName: string;
}
export interface Participant extends Resource {
	areDetails: AreParticipantDetails;
	mobileDeviceDetails: MobileDevice;
	pluginDeviceDetails: PluginDevice;
	registrationDetails: Registration;
	snapshotDetails: SnapshotParticipantDetails;
	telematicsId: string;
	ubiFeatureActivationDateTime?: Date;
	homebaseParticipantSummaryResponse: HomebaseParticipantSummaryResponse;
}
export interface CommercialParticipant extends Resource {
	areDetails: AreParticipantDetails;
	mobileDeviceDetails: MobileDevice;
	pluginDeviceDetails: PluginDevice;
	registrationDetails: Registration;
	snapshotDetails: SnapshotParticipantDetails;
	telematicsId: string;
}

export interface ParticipantCalculatedInitialValues extends Resource {
	beginScoreCheckDate: Date;
	createDate: Date;
	endorsementAppliedDate: Date;
	isEmailSent: boolean;
	isEndorsementDiscountZero: boolean;
	isInProcessitemReturned: boolean;
	isScoreCalculated: boolean;
	lastUpdateDate: Date;
	scoreInfo: ParticipantCalculatedRenewalValues;
}
export interface ParticipantCalculatedRenewalValues extends Resource {
	calculatorMessage: string;
	connectedDays: number;
	connectedSeconds: number;
	createDate: Date;
	eligibilityIndicator: string;
	endDate: Date;
	policyNumber: string;
	policySuffix: string;
	startDate: Date;
	totalDisconnectEvents: number;
	ubiScore: string;
	ubiValue: string;
}
export interface ParticipantCalculatedValues extends Resource {
	connectedDays: number;
	connectedSeconds: number;
	disconnectCount: number;
	disconnectedSeconds: number;
	participantSeqId: number;
	scoringDetails: ParticipantScoringData;
	ubiScore: number;
	ubiValue: number;
}
export interface ParticipantDeviceTripEvent {
	createDate: Date;
	eventCode: number;
	eventDescription: string;
	eventSeqId: number;
	eventTime: Date;
	odometerReading: number;
	protocolCode: Enums.ProtocolCode;
	vin: string;
}

export interface ParticipantJunction extends Resource {
	changeEffectiveDate: Date;
	deviceExperienceTypeCode: Enums.DeviceExperience;
	deviceSeqID: number;
	deviceSerialNumber: string;
	driverSeqID: number;
	expirationDate: Date;
	expirationYear: number;
	homeBaseDeviceSeqID: number;
	inceptionDate: Date;
	junctionVersion: number;
	junctionVersionSeq: number;
	mobileDeviceAliasName: string;
	participantExternalID: string;
	participantID: string;
	participantSeqID: number;
	pendingDeviceSerialNumber: string;
	policyPeriodSeqID: number;
	policySuffix: number;
	rateRevision: string;
	reasonCode: Enums.ParticipantReasonCode;
	scoringAlgorithmData: ScoringAlgorithmData;
	status: Enums.ParticipantStatus;
	systemName: string;
	vehicleSeqID: number;
	vin: string;
	ymm: string;
}

export interface ParticipantScoringData extends Resource {
	experience: Enums.DeviceExperience;
	mobileCalculator: Enums.MobileValueCalculatorType;
	mobileSummarizerVersionCode: number;
	monitoringCompleteConnectDays: number;
	pluginCalculator: Enums.OBDValueCalculatorType;
	ratedDistractedDrivingInd: boolean;
	state: string;
}
export interface PluginDevice extends Resource {
	deviceAbandonedDate: Date;
	deviceManufacturer: string;
	deviceReceivedDate: Date;
	deviceSeqId: number;
	deviceSerialNumber: string;
	deviceVersion: string;
	features: Enums.DeviceFeature[];
	firmwareDetails: DeviceFirmwareDetails;
	history: DeviceHistory;
	homeBaseDeviceSeqId: number;
	lastRemoteResetDateTime: Date;
	location: string;
	pendingDeviceSerialNumber: string;
	reportedVIN: string;
	returnReasonCode: Enums.DeviceReturnReasonCode;
	shipDateTime: Date;
	sim: string;
	status: string;
	wirelessStatus: string;
}
export interface Policy extends Resource {
	areDetails: ArePolicyDetails;
	channelIndicator: string;
	participants: Participant[];
	policyNumber: string;
	policyPeriodDetails: PolicyPeriod[];
	snapshotDetails: SnapshotPolicyDetails;
}

export interface PolicyDriverData extends Resource {
	driverFirstName: string;
	driverLastName: string;
	pJStatus: string;
	policyNumber: string;
}
export interface PolicyEnrolledFeatures extends Resource {
	isEnrolledInAre: boolean;
	isEnrolledInSnapshot: boolean;
}
export interface PolicyPeriod extends Resource {
	createDate: Date;
	expirationDate: Date;
	groupExternalId: string;
	inceptionDate: Date;
	lastChangeDateTime: Date;
	policyPeriodSeqId: number;
	policySeqId: number;
	policySuffix: number;
	policySystem: string;
	rateRevision: string;
}
export interface Registration extends Resource {
	challengeExpirationDateTime: Date;
	challengeRequestCount: number;
	driverExternalId: string;
	driverFirstName: string;
	driverLastName: string;
	groupExternalId: string;
	lastChangeDateTime: Date;
	mobileApiTokenId: string;
	mobileChallengeCode: string;
	mobileDeviceId: string;
	mobileLastRegistrationDateTime: Date;
	mobileRegistrationCode: string;
	mobileRegistrationSeqId: number;
	statusSummary: Enums.MobileRegistrationStatusSummary;
	newMobileRegistrationStatusDescription: string;
	participantExternalId: string;
	policyParticipant: PolicyDriverData;
	programCode: Enums.ProgramCode;
	vehicleExternalId: string;
}
export interface SnapshotParticipantDetails extends Resource {
	billingTransactions: BillingTransaction[];
	changeEffectiveDate: Date;
	communications: Communication[];
	compatibilityIssues: CompatibilityItem[];
	enrollmentDate: Date;
	enrollmentExperience: Enums.DeviceExperience;
	firstContactDateTime: Date;
	initialFirstContactDateTime: Date;
	lastContactDateTime: Date;
	lastUploadDateTime: Date;
	monitoringCompleteConnectDays: number;
	optOutDetails: OptOutData;
	participantId: string;
	participantSeqId: number;
	policyStartDate: Date;
	programType: Enums.ProgramType;
	reasonCode: Enums.ParticipantReasonCode;
	scoringAlgorithmData: ScoringAlgorithmData;
	status: Enums.ParticipantStatus;
	trialStartDate: Date;
	vehicleDetails: Vehicle;
}
export interface SnapshotPolicyDetails extends Resource {
	appInfo: AppInfo;
	createDate: Date;
	expirationDate: Date;
	groupExternalId: string;
	inceptionDate: Date;
	mailingAddress: Address;
	policySystem: string;
}
export interface SupportPolicy extends Resource {
	activeEmailAddress: string;
	address1: string;
	address2: string;
	channelIndicator: string;
	city: string;
	createDate: Date;
	deviceCategoryID: number;
	emailAddress: string;
	firstTimeLogin: Date;
	lastReconcileDate: Date;
	mailingState: string;
	name: string;
	needsLabelPrinted: string;
	participationSubType: string;
	participationType: string;
	policyNumber: string;
	policySeqID: number;
	productCode: string;
	sourceCode: string;
	state: string;
	trialCustomerID: string;
	zipCode: string;
}
export interface TransactionAuditLog extends Resource {
	createDate: Date;
	policyNumber: string;
	resolutionComments: string;
	resolutionStatus: string;
	resultMessage: string;
	resultStatus: string;
	transactionAuditSeqId: number;
	transactionData: string;
	transactionName: string;
}
export interface TripEvent {
	description: string;
	eventDate: Date;
	eventTypeSeqId: number;
	speed: number;
}
export interface TripSummary extends Resource {
	trips: TripSummaryDaily[];
}
export interface TripSummaryDaily extends Resource {
	distractedDrivingInfo: TripSummaryDistractedDriving;
	duration: TimeSpan;
	extremeHardBrakes: number;
	hardAccelerations: number;
	hardBrakes: number;
	highRisk: string;
	highRiskSeconds: number;
	lowRisk: string;
	mediumRisk: string;
	mileage: number;
	seqId: number;
	tripCount: number;
	tripDate: Date;
	tripEndDate: Date;
	tripRegularity: number;
}
export interface TripSummaryDistractedDriving extends Resource {
	applicationUsageHandsFree: number;
	applicationUsageInHand: number;
	phoneUsageHandsFree: number;
	phoneUsageInHand: number;
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
	isInMobileRegSearchPilot: boolean;
	lanId: string;

	name: string;
}

export interface Vehicle extends Resource {
	make: string;
	model: string;
	vehicleExternalId: string;
	vin: string;
	year: number;
}

export interface ScoringAlgorithmData extends Resource {
	code: number;
	createDateTime: Date;
	description: string;
	invalidDistractedDrivingCode: number;
	isActive: boolean;
	mobileSummarizerCode: number;
	mobileValueCalculatorCode: number;
	oBD2SummarizerCode: number;
	oBD2ValueCalculatorCode: number;
	ratedDistractedDrivingInd: number;
}

export class HomebaseParticipantSummaryResponse implements IHomebaseParticipantSummaryResponse {
	adActivated: boolean;
	adEnrolled: boolean;
	driverReferenceId: string;
	policyNumber: string;
	telematicsId: string;
	tmxMobileRegistered: boolean;
	ubiActivated: boolean;
	ubiEnrolled: boolean;
	ubiExperience: Enums.DeviceExperience;
}

export interface IHomebaseParticipantSummaryResponse {
	adActivated: boolean;
	adEnrolled: boolean;
	driverReferenceId: string;
	policyNumber: string;
	telematicsId: string;
	tmxMobileRegistered: boolean;
	ubiActivated: boolean;
	ubiEnrolled: boolean;
	ubiExperience: Enums.DeviceExperience;
}
export interface HomebasePolicySummaryResponse {
	participants: HomebaseParticipantSummaryResponse[];
	policy: string;
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
export interface KeyValuePair<TKey, TValue> {
	key: TKey;
	value: TValue;
}
export interface EligibleZipCode {
	state: string;
	zipCode: string;
}
export interface IncidentResolution {
	createDateTime: Date;
	incidentResolutionSeqId: number;
	kbaDescription: string;
	kbaId: string;
	lastChangeDateTime: Date;
	lastChangeUserId: string;
	stepNumber: number;
	storedProcedureName: string;
}
export interface SPParameter {
	dataType: string;
	length: number;
	name: string;
	value: string;
}
export interface IneligibleVehicle {
	createDate: Date;
	deviceDescription: string;
	deviceManufacturer: string;
	deviceVersion: string;
	deviceVersionSeqID: number;
	exactModelMatchInd: string;
	excludedMakeInd: string;
	ineligibleVehicleSeqID: number;
	lastChangeDateTime: Date;
	make: string;
	model: string;
	modelYear: string;
}
export interface CommercialPolicy {
	policySeqId: number;
	policyNumber: string;
	address: Address | null;
	emailAddress: string;
	sendDashboard: boolean;
	createdDate: Date | null;
	participants: CommercialParticipantJunction[];
}

export interface CommercialParticipantJunction extends Resource {
	programType: any;
	participantSeqId: number;
	isCommunicationAllowed: boolean;
	wirelessStatus: any;
	participantID: string | null;
	deviceSeqId: string | null;
	status: Enums.ParticipantStatus | null;
	reasonCode: Enums.ParticipantReasonCode | null;
	changeDate: Date | null;
	YMM: string | null;
	ymm: string | null;
	vin: string | null;
	vehicleSeqId: number | null;
	deviceReportedVIN: string | null;
	deviceStatus: string | null;
	deviceType: string | null;
	serialNumber: string | null;
	sim: string | null;
	enrolledDate: string | null;
	shipDate: Date | null;
	firstContactDate: Date | null;
	lastContactDate: Date | null;
	returnDate: Date | null;
	returnReason: string | null;
	abandonDate: Date | null;
	deviceLocation: string | null;
	orderId: number | null;
	// need to find these
	features: any;
	deviceReceivedDate: any;
	deviceAbandonedDate: any;
}

export interface DeviceOrderCreatedResponse {
	newDeviceOrderId: number;
	deviceOrderDetailIds: number[];
}

export interface RemoveOptOutResponse {
	createdDeviceOrders: DeviceOrderCreatedResponse[];
}

export interface CommercialTrips {
	trips: number;
	date: Date;
	duration: TimeSpan;
	distance: number;
	hardBreaks: number;
	excluded: boolean;
	details: CommercialTrip[];
}
export interface CommercialTrip {
	trips: number;
	date: Date;
	duration: TimeSpan;
	distance: number;
	hardBreaks: number;
	excluded: boolean;
	startDate: Date;
	endDate: Date;
}

export interface EventPairs {
	connection: Date;
	disconnection: Date;
	disconnectionDuration: string;
}

export interface ColumnDefinition {
	name: string;
	label: string;
	value: string;
	sortable?: boolean;
	format?: "Date" | "DateTime" | "Duration" | "KmToMiles";
	width: "Small" | "Medium" | "Large" | "Ellipse";
	functionName?: string;
}

export interface FilterSortEvent {
	pageEvent: PageEvent;
	sort: Sort | null;
	filters: QueryFilter[] | null;
}

export interface FilterType {
	name: string;
	label: string;
}

export interface QueryFilter {
	property: string;
	filter: any;
}
