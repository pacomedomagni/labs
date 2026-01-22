import * as Enums from './enums';

	export interface Resource {
		extenders: Map<string, any>[];
		messages: KeyValuePair<Enums.MessageCode, any>[];
	}
	export interface Address extends Resource {
		address1: string;
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
		driverFirstName: string;
		driverReferenceId: string;
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
	export interface CommercialAddress {
		address1: string;
		city: string;
		contactName: string;
		postalCode: string;
		state: string;
	}
	export interface CommercialParticipant extends Resource {
		abandonDate: Date;
		changeDate: Date;
		deviceLocation: number;
		deviceOrderId: number;
		deviceReportedVIN: string;
		deviceSeqId: number;
		deviceStatus: number;
		deviceType: string;
		enrolledDate: Date;
		firstContactDate: Date;
		isCommunicationAllowed: boolean;
		lastContactDate: Date;
		participantId: string;
		participantSeqId: number;
		policySeqID: string;
		returnDate: Date;
		returnReason: string;
		serialNumber: string;
		shipDate: Date;
		sim: string;
		status: string;
		vehicleSeqId: number;
		vIN: string;
		yMM: string;
	}
	export interface CommercialPolicy {
		address: CommercialAddress;
		createdDate: Date;
		emailAddress: string;
		participants: CommercialParticipant[];
		policyNumber: string;
		policySeqId: number;
		policySystem: string;
		sendDashboard: boolean;
	}
	export interface CommercialTrip {
		date: Date;
		distance: number;
		duration: TimeSpan;
		endDate: Date;
		excluded: boolean;
		hardBreaks: number;
		startDate: Date;
		trips: number;
		tripSeqID: number;
	}
	export interface CommercialTrips {
		date: Date;
		details: CommercialTrip[];
		distance: number;
		duration: TimeSpan;
		excluded: boolean;
		hardBreaks: number;
		trips: number;
		tripSeqID: number;
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
	export interface DeviceDetails extends Resource {
		benchTestStatusCode: number;
		binaryTransferInfo: string;
		cellFirmwareTypeVersionCode: number;
		configurationFirmwareTypeVersionCode: number;
		createDateTime: Date;
		currentAudioVolume: number;
		description: string;
		deviceSeqID: number;
		deviceSerialNumber: string;
		firstContactDateTime: Date;
		gPSCollectionTypeCode: number;
		gPSFirmwareTypeVersionCode: number;
		iMEI: string;
		inventoryLotSeqID: number;
		isCommunicationAllowed: boolean;
		isDataCollectionAllowed: boolean;
		isDBImportAllowed: boolean;
		isRefurbished: boolean;
		isSimActive: boolean;
		lastChangeDateTime: Date;
		lastContactDateTime: Date;
		lastRemoteResetDateTime: Date;
		lastUploadDateTime: Date;
		locationCode: number;
		mainFirmwareTypeVersionCode: number;
		manufacturerLotSeqID: number;
		oBD2FirmwareTypeVersionCode: number;
		programCode: number;
		reportedProtocolCode: number;
		reportedVIN: string;
		returnLotSeqID: number;
		rMALotSeqID: number;
		shipDateTime: Date;
		sIM: string;
		statusCode: number;
		targetAudioVolume: number;
		targetFirmwareSetCode: number;
		versionCode: number;
		wTFStateInfo: string;
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
		isPausedInd: boolean;
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
	export interface MobilePause extends Resource {
		actualEndOffsetDateTime: Date;
		actualStartOffsetDateTime: Date;
		scheduledEndOffsetDateTime: Date;
		scheduledStartOffsetDateTime: Date;
	}
	export interface MobilePauseHistory extends Resource {
		isPaused: boolean;
		pauseInfo: MobilePause[];
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
		uBIFeatureActivationDateTime: Date;
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
		scoringAlgorithmCode: number;
		scoringAlgorithmData: Resources.Shared.ScoringAlgorithmData;
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
		transactionError: string;
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
		createDateTime: Date;
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
		mobileRegistrationStatusCode: Enums.MobileRegistrationStatus;
		mobileReregisteredInd: boolean;
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
		scoringAlgorithmCode: number;
		scoringAlgorithmData: Resources.Shared.ScoringAlgorithmData;
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
		hasEligibilityAccess: boolean;
		hasInsertInitialParticipationScoreInProcessAccess: boolean;
		hasOptOutSuspensionAccess: boolean;
		hasPolicyMergeAccess: boolean;
		hasResetEnrollmentAccess: boolean;
		hasStopShipmentAccess: boolean;
		hasUpdatePProGuidAccess: boolean;
		hasVehicleSupportAccess: boolean;
		isCommercialLineRole: boolean;
		isInAppChangeRole: boolean;
		isInFeeReversalOnlyRole: boolean;
		isInFeeReversalRole: boolean;
		isInMobileRegistrationAdminRole: boolean;
		isInOpsAdminRole: boolean;
		isInOpsUserRole: boolean;
		isInSupportAdminRole: boolean;
		isInTheftOnlyRole: boolean;
		isInTheftRole: boolean;
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
	export interface HomebaseParticipantSummaryResponse {
		aDActivated: boolean;
		aDEnrolled: boolean;
		cADExperience: boolean;
		driverReferenceId: string;
		policyNumber: string;
		telematicsId: string;
		tMXMobileRegistered: boolean;
		uBIActivated: boolean;
		uBIEnrolled: boolean;
		uBIExperience: Enums.DeviceExperience;
	}
	export interface HomebasePolicySummaryResponse {
		participants: HomebaseParticipantSummaryResponse[];
		policy: string;
	}
	export interface SnapshotParticipant {
		aDActivated: boolean;
		aDEnrolled: boolean;
		cADExperience: boolean;
		deviceExperienceType: Enums.DeviceExperience;
		driverFirstName: string;
		driverLastName: string;
		mobileRegistered: boolean;
		mobileRegistrationCode: string;
		participantExternalId: string;
		participantId: string;
		policyNumber: string;
		programModel: string;
		snapshotVersion: string;
		uBIActivated: boolean;
		uBIEnrolled: boolean;
		uBIFeatureActivationDateTime: Date;
		vehicleMake: string;
		vehicleModel: string;
		vehicleYear: number;
	}
	export interface SnapshotSummaryResponse {
		participants: SnapshotParticipant[];
		policyNumber: string;
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
