	export enum AreExperience {
		ARE = 'ARE',
		CAD = 'CAD'
	}
	export enum DeviceActivationRequestType {
		Status = 'Status',
		Activate = 'Activate',
		Deactivate = 'Deactivate'
	}
	export enum DeviceExperience {
		None = 'None',
		Device = 'Device',
		Mobile = 'Mobile',
		OEM = 'OEM'
	}
	export enum DeviceFeature {
		Audio = 'Audio',
		BlueLight = 'BlueLight',
		Accelerometer = 'Accelerometer',
		GPS = 'GPS',
		GPSToggle = 'GPSToggle',
		AWSIot = 'AWSIot'
	}
	export enum DeviceLocation {
		Progressive = 'Progressive',
		Distributor = 'Distributor',
		ShippedFromMfgtoDist = 'ShippedFromMfgtoDist',
		ShippedFromPrgtoDist = 'ShippedFromPrgtoDist',
		ShippedToCustomer = 'ShippedToCustomer',
		InVehicle = 'InVehicle',
		Unknown = 'Unknown'
	}
	export enum DeviceLotStatus {
		ShippedToDistributor = 'ShippedToDistributor',
		ShipmentReceivedByDistributor = 'ShipmentReceivedByDistributor',
		AssigningDevices = 'AssigningDevices',
		UsedForTest = 'UsedForTest',
		ShippedToManufacturer = 'ShippedToManufacturer',
		ShipmentReceivedByManufacturer = 'ShipmentReceivedByManufacturer',
		AssignedToRMA = 'AssignedToRMA',
		Storage = 'Storage',
		Obsolete = 'Obsolete'
	}
	export enum DeviceLotType {
		Manufacturer = 'Manufacturer',
		Returned = 'Returned',
		RMA = 'RMA',
		Inventory = 'Inventory'
	}
	export enum DeviceReturnReasonCode {
		OptOut = 'OptOut',
		Cancel = 'Cancel',
		NonInstaller = 'NonInstaller',
		DeviceReplaced = 'DeviceReplaced',
		CustomerReturn = 'CustomerReturn',
		DeviceProblem = 'DeviceProblem',
		DeviceRefused = 'DeviceRefused',
		DeviceUnclaimed = 'DeviceUnclaimed',
		MarkedReturned = 'MarkedReturned',
		DeviceUndeliverable = 'DeviceUndeliverable',
		Abandoned = 'Abandoned',
		NonCommunicator = 'NonCommunicator',
		DiscountQualified = 'DiscountQualified',
		DiscountDisqualified = 'DiscountDisqualified',
		ManualMonitoringComplete = 'ManualMonitoringComplete'
	}
	export enum DeviceStatus {
		Available = 'Available',
		Inactive = 'Inactive',
		Assigned = 'Assigned',
		Abandoned = 'Abandoned',
		CustomerReturn = 'CustomerReturn',
		Unavailable = 'Unavailable',
		Defective = 'Defective',
		Batched = 'Batched',
		ReadyForPrep = 'ReadyForPrep',
		ReadyForBenchTest = 'ReadyForBenchTest'
	}
	export enum MessageCode {
		Error = 'Error',
		ErrorCode = 'ErrorCode',
		ErrorDetails = 'ErrorDetails',
		Handled = 'Handled',
		StackTrace = 'StackTrace',
		StatusCode = 'StatusCode',
		StatusDescription = 'StatusDescription'
	}
	export enum MobileRegistrationStatus {
		None = 'None',
		Disabled = 'Disabled',
		Inactive = 'Inactive',
		PendingResolution = 'PendingResolution',
		Locked = 'Locked',
		NotRegistered = 'NotRegistered',
		ChallengeInProcess = 'ChallengeInProcess',
		ChallegeError = 'ChallegeError',
		ChallengeComplete = 'ChallengeComplete',
		Authenticated = 'Authenticated',
		VehicleSelectionComplete = 'VehicleSelectionComplete',
		ServerVerifyComplete = 'ServerVerifyComplete',
		RegistrationCompleteInProcess = 'RegistrationCompleteInProcess',
		RegistrationCompleteError = 'RegistrationCompleteError',
		RegistrationComplete = 'RegistrationComplete'
	}
	export enum MobileValueCalculatorType {
		Calculator2008 = 'Calculator2008',
		Calculator2015 = 'Calculator2015',
		Calculator2018WithDistractedDriving = 'Calculator2018WithDistractedDriving',
		Calculator2018WithoutDistractedDriving = 'Calculator2018WithoutDistractedDriving',
		Calculator2020WithDistractedDriving = 'Calculator2020WithDistractedDriving',
		Calculator2020WithoutDistractedDriving = 'Calculator2020WithoutDistractedDriving',
		Calculator2021WithDistractedDriving = 'Calculator2021WithDistractedDriving',
		Calculator2021WithoutDistractedDriving = 'Calculator2021WithoutDistractedDriving'
	}
	export enum OBDValueCalculatorType {
		Calculator2008 = 'Calculator2008',
		Calculator2015 = 'Calculator2015',
		Calculator2018 = 'Calculator2018',
		Calculator2020 = 'Calculator2020',
		Calculator2021 = 'Calculator2021'
	}
	export enum OptOutReasonCode {
		CustomerOptOut = 'CustomerOptOut',
		Cancel = 'Cancel',
		DriverDelete = 'DriverDelete',
		VehicleDelete = 'VehicleDelete',
		NonInstaller = 'NonInstaller',
		NonCommunicator = 'NonCommunicator',
		NotFitMilesTrips = 'NotFitMilesTrips',
		NotFitCategoryChangePct = 'NotFitCategoryChangePct',
		MonitoringComplete = 'MonitoringComplete',
		NotCompleteTwoTerms = 'NotCompleteTwoTerms'
	}
	export enum ParticipantReasonCode {
		None = 'None',
		ParticipantOptedOut = 'ParticipantOptedOut',
		PolicyCanceled = 'PolicyCanceled',
		RenewalWorkCreated = 'RenewalWorkCreated',
		CollectingData = 'CollectingData',
		NeedsDeviceAssigned = 'NeedsDeviceAssigned',
		DeviceReplacementNeeded = 'DeviceReplacementNeeded',
		FlatDelete = 'FlatDelete',
		DeviceReturnedAutomatedOptOutInProcess = 'DeviceReturnedAutomatedOptOutInProcess',
		AutomatedOptOutEndorsementPending = 'AutomatedOptOutEndorsementPending',
		AutomatedOptInEndorsementPending = 'AutomatedOptInEndorsementPending',
		MobilePendingRegistration = 'MobilePendingRegistration'
	}
	export enum ParticipantStatus {
		Active = 'Active',
		Inactive = 'Inactive',
		Pending = 'Pending',
		Renewal = 'Renewal',
		Unenrolled = 'Unenrolled'
	}
	export enum ProgramCode {
		Unknown = 'Unknown',
		Snapshot = 'Snapshot',
		Trial = 'Trial',
		Labs = 'Labs'
	}
	export enum ProgramType {
		PriceModel2 = 'PriceModel2',
		PriceModel3 = 'PriceModel3',
		PriceModel4 = 'PriceModel4',
		PriceModel5 = 'PriceModel5'
	}
	export enum ProtocolCode {
		UnknownProtocol = 'UnknownProtocol',
		ISO9141_1 = 'ISO9141_1',
		ISO9141_2 = 'ISO9141_2',
		KwipSlowInit = 'KwipSlowInit',
		KwipFastInit = 'KwipFastInit',
		PWM = 'PWM',
		VPWM = 'VPWM',
		CAN_11_250kbits = 'CAN_11_250kbits',
		CAN_11_500kbits = 'CAN_11_500kbits',
		CAN_29_250kbits = 'CAN_29_250kbits',
		CAN_29_500kbits = 'CAN_29_500kbits',
		CAN = 'CAN',
		ISO = 'ISO',
		KWP = 'KWP',
		VPW = 'VPW',
		J1939 = 'J1939',
		KW1281 = 'KW1281',
		KW71 = 'KW71',
		KW81 = 'KW81',
		KW82 = 'KW82',
		ALDL = 'ALDL'
	}
	export enum RegistrationStatusUpdateAction {
		None = 'None',
		Enable = 'Enable',
		Inactive = 'Inactive',
		Unlock = 'Unlock'
	}
	export enum States {
		AL = 'AL',
		AK = 'AK',
		AR = 'AR',
		AZ = 'AZ',
		CA = 'CA',
		CO = 'CO',
		CT = 'CT',
		DC = 'DC',
		DE = 'DE',
		FL = 'FL',
		GA = 'GA',
		HI = 'HI',
		IA = 'IA',
		ID = 'ID',
		IL = 'IL',
		IN = 'IN',
		KS = 'KS',
		KY = 'KY',
		LA = 'LA',
		MA = 'MA',
		MD = 'MD',
		ME = 'ME',
		MI = 'MI',
		MN = 'MN',
		MO = 'MO',
		MS = 'MS',
		MT = 'MT',
		NC = 'NC',
		ND = 'ND',
		NE = 'NE',
		NH = 'NH',
		NJ = 'NJ',
		NM = 'NM',
		NV = 'NV',
		NY = 'NY',
		OK = 'OK',
		OH = 'OH',
		OR = 'OR',
		PA = 'PA',
		RI = 'RI',
		SC = 'SC',
		SD = 'SD',
		TN = 'TN',
		TX = 'TX',
		UT = 'UT',
		VA = 'VA',
		VT = 'VT',
		WA = 'WA',
		WI = 'WI',
		WV = 'WV',
		WY = 'WY'
	}
	export enum StopShipmentMethod {
		SetMonitoringComplete = 'SetMonitoringComplete',
		OptOut = 'OptOut'
	}
	export enum TelematicsFeatures {
		AccidentDetection = 'AccidentDetection',
		Snapshot = 'Snapshot'
	}
	export enum UnenrollReason {
		DeviceNotEligible = 'DeviceNotEligible',
		DriverAdded = 'DriverAdded',
		DriverLicenseChange = 'DriverLicenseChange',
		DriverNotEligible = 'DriverNotEligible',
		DriverStatusChange = 'DriverStatusChange',
		ExpireNonPay = 'ExpireNonPay',
		NonCommunicator = 'NonCommunicator',
		NonInstaller = 'NonInstaller',
		PolicyCancel = 'PolicyCancel',
		UserInitiated = 'UserInitiated',
        VehicleAdded = 'VehicleAdded'
		DriverDeleted = 'DriverDeleted'
	}
	export enum UserAccess {
		Eligibility = 'Eligibility',
		InsertInitialParticipationScoreInProcess = 'InsertInitialParticipationScoreInProcess',
		OptOutSuspension = 'OptOutSuspension',
		PolicyMerge = 'PolicyMerge',
		ResetEnrollment = 'ResetEnrollment',
		StopShipment = 'StopShipment',
		UpdatePProGuid = 'UpdatePProGuid',
		VehicleSupport = 'VehicleSupport'
	}
	export enum UserRoles {
		OpsAdmin = 'OpsAdmin',
		OpsUser = 'OpsUser',
		SupportAdmin = 'SupportAdmin',
		Theft = 'Theft',
		MobileRegistrationAdmin = 'MobileRegistrationAdmin',
		ChangeAppAssignment = 'ChangeAppAssignment',
		FeeReversal = 'FeeReversal',
		CommercialLineRole = 'CommercialLineRole'
	}
	export const AreExperienceValue = new Map<AreExperience, number>([
		[AreExperience.ARE, 0],
		[AreExperience.CAD, 1],
	]);
	export const DeviceActivationRequestTypeValue = new Map<DeviceActivationRequestType, number>([
		[DeviceActivationRequestType.Status, 0],
		[DeviceActivationRequestType.Activate, 1],
		[DeviceActivationRequestType.Deactivate, 2],
	]);
	export const DeviceExperienceValue = new Map<DeviceExperience, number>([
		[DeviceExperience.None, 0],
		[DeviceExperience.Device, 1],
		[DeviceExperience.Mobile, 2],
		[DeviceExperience.OEM, 3],
	]);
	export const DeviceFeatureValue = new Map<DeviceFeature, number>([
		[DeviceFeature.Audio, 1],
		[DeviceFeature.BlueLight, 2],
		[DeviceFeature.Accelerometer, 3],
		[DeviceFeature.GPS, 4],
		[DeviceFeature.GPSToggle, 5],
		[DeviceFeature.AWSIot, 6],
	]);
	export const DeviceLocationValue = new Map<DeviceLocation, number>([
		[DeviceLocation.Progressive, 1],
		[DeviceLocation.Distributor, 2],
		[DeviceLocation.ShippedFromMfgtoDist, 3],
		[DeviceLocation.ShippedFromPrgtoDist, 4],
		[DeviceLocation.ShippedToCustomer, 5],
		[DeviceLocation.InVehicle, 6],
		[DeviceLocation.Unknown, 7],
	]);
	export const DeviceLotStatusValue = new Map<DeviceLotStatus, number>([
		[DeviceLotStatus.ShippedToDistributor, 1],
		[DeviceLotStatus.ShipmentReceivedByDistributor, 2],
		[DeviceLotStatus.AssigningDevices, 3],
		[DeviceLotStatus.UsedForTest, 4],
		[DeviceLotStatus.ShippedToManufacturer, 5],
		[DeviceLotStatus.ShipmentReceivedByManufacturer, 6],
		[DeviceLotStatus.AssignedToRMA, 7],
		[DeviceLotStatus.Storage, 8],
		[DeviceLotStatus.Obsolete, 9],
	]);
	export const DeviceLotTypeValue = new Map<DeviceLotType, number>([
		[DeviceLotType.Manufacturer, 1],
		[DeviceLotType.Returned, 2],
		[DeviceLotType.RMA, 3],
		[DeviceLotType.Inventory, 4],
	]);
	export const DeviceReturnReasonCodeValue = new Map<DeviceReturnReasonCode, number>([
		[DeviceReturnReasonCode.OptOut, 1],
		[DeviceReturnReasonCode.Cancel, 2],
		[DeviceReturnReasonCode.NonInstaller, 3],
		[DeviceReturnReasonCode.DeviceReplaced, 4],
		[DeviceReturnReasonCode.CustomerReturn, 5],
		[DeviceReturnReasonCode.DeviceProblem, 6],
		[DeviceReturnReasonCode.DeviceRefused, 7],
		[DeviceReturnReasonCode.DeviceUnclaimed, 8],
		[DeviceReturnReasonCode.MarkedReturned, 9],
		[DeviceReturnReasonCode.DeviceUndeliverable, 10],
		[DeviceReturnReasonCode.Abandoned, 11],
		[DeviceReturnReasonCode.NonCommunicator, 12],
		[DeviceReturnReasonCode.DiscountQualified, 13],
		[DeviceReturnReasonCode.DiscountDisqualified, 14],
		[DeviceReturnReasonCode.ManualMonitoringComplete, 15],
	]);
	export const DeviceStatusValue = new Map<DeviceStatus, number>([
		[DeviceStatus.Available, 1],
		[DeviceStatus.Inactive, 2],
		[DeviceStatus.Assigned, 3],
		[DeviceStatus.Abandoned, 4],
		[DeviceStatus.CustomerReturn, 5],
		[DeviceStatus.Unavailable, 6],
		[DeviceStatus.Defective, 7],
		[DeviceStatus.Batched, 8],
		[DeviceStatus.ReadyForPrep, 9],
		[DeviceStatus.ReadyForBenchTest, 10],
	]);
	export const MessageCodeValue = new Map<MessageCode, number>([
		[MessageCode.Error, 0],
		[MessageCode.ErrorCode, 1],
		[MessageCode.ErrorDetails, 2],
		[MessageCode.Handled, 3],
		[MessageCode.StackTrace, 4],
		[MessageCode.StatusCode, 5],
		[MessageCode.StatusDescription, 6],
	]);
	export const MobileRegistrationStatusValue = new Map<MobileRegistrationStatus, number>([
		[MobileRegistrationStatus.None, -1],
		[MobileRegistrationStatus.Disabled, 0],
		[MobileRegistrationStatus.Inactive, 2],
		[MobileRegistrationStatus.PendingResolution, 6],
		[MobileRegistrationStatus.Locked, 8],
		[MobileRegistrationStatus.NotRegistered, 10],
		[MobileRegistrationStatus.ChallengeInProcess, 20],
		[MobileRegistrationStatus.ChallegeError, 22],
		[MobileRegistrationStatus.ChallengeComplete, 24],
		[MobileRegistrationStatus.Authenticated, 30],
		[MobileRegistrationStatus.VehicleSelectionComplete, 40],
		[MobileRegistrationStatus.ServerVerifyComplete, 50],
		[MobileRegistrationStatus.RegistrationCompleteInProcess, 60],
		[MobileRegistrationStatus.RegistrationCompleteError, 62],
		[MobileRegistrationStatus.RegistrationComplete, 64],
	]);
	export const MobileValueCalculatorTypeValue = new Map<MobileValueCalculatorType, number>([
		[MobileValueCalculatorType.Calculator2008, 1],
		[MobileValueCalculatorType.Calculator2015, 2],
		[MobileValueCalculatorType.Calculator2018WithDistractedDriving, 3],
		[MobileValueCalculatorType.Calculator2018WithoutDistractedDriving, 4],
		[MobileValueCalculatorType.Calculator2020WithDistractedDriving, 5],
		[MobileValueCalculatorType.Calculator2020WithoutDistractedDriving, 6],
		[MobileValueCalculatorType.Calculator2021WithDistractedDriving, 7],
		[MobileValueCalculatorType.Calculator2021WithoutDistractedDriving, 8],
	]);
	export const OBDValueCalculatorTypeValue = new Map<OBDValueCalculatorType, number>([
		[OBDValueCalculatorType.Calculator2008, 1],
		[OBDValueCalculatorType.Calculator2015, 2],
		[OBDValueCalculatorType.Calculator2018, 3],
		[OBDValueCalculatorType.Calculator2020, 4],
		[OBDValueCalculatorType.Calculator2021, 5],
	]);
	export const OptOutReasonCodeValue = new Map<OptOutReasonCode, number>([
		[OptOutReasonCode.CustomerOptOut, 1],
		[OptOutReasonCode.Cancel, 2],
		[OptOutReasonCode.DriverDelete, 3],
		[OptOutReasonCode.VehicleDelete, 4],
		[OptOutReasonCode.NonInstaller, 5],
		[OptOutReasonCode.NonCommunicator, 6],
		[OptOutReasonCode.NotFitMilesTrips, 7],
		[OptOutReasonCode.NotFitCategoryChangePct, 8],
		[OptOutReasonCode.MonitoringComplete, 9],
		[OptOutReasonCode.NotCompleteTwoTerms, 10],
	]);
	export const ParticipantReasonCodeValue = new Map<ParticipantReasonCode, number>([
		[ParticipantReasonCode.None, 0],
		[ParticipantReasonCode.ParticipantOptedOut, 1],
		[ParticipantReasonCode.PolicyCanceled, 2],
		[ParticipantReasonCode.RenewalWorkCreated, 8],
		[ParticipantReasonCode.CollectingData, 11],
		[ParticipantReasonCode.NeedsDeviceAssigned, 14],
		[ParticipantReasonCode.DeviceReplacementNeeded, 16],
		[ParticipantReasonCode.FlatDelete, 22],
		[ParticipantReasonCode.DeviceReturnedAutomatedOptOutInProcess, 42],
		[ParticipantReasonCode.AutomatedOptOutEndorsementPending, 43],
		[ParticipantReasonCode.AutomatedOptInEndorsementPending, 44],
		[ParticipantReasonCode.MobilePendingRegistration, 60],
	]);
	export const ParticipantStatusValue = new Map<ParticipantStatus, number>([
		[ParticipantStatus.Active, 0],
		[ParticipantStatus.Inactive, 1],
		[ParticipantStatus.Pending, 2],
		[ParticipantStatus.Renewal, 3],
		[ParticipantStatus.Unenrolled, 4],
	]);
	export const ProgramCodeValue = new Map<ProgramCode, number>([
		[ProgramCode.Unknown, 0],
		[ProgramCode.Snapshot, 1],
		[ProgramCode.Trial, 2],
		[ProgramCode.Labs, 3],
	]);
	export const ProgramTypeValue = new Map<ProgramType, number>([
		[ProgramType.PriceModel2, 0],
		[ProgramType.PriceModel3, 1],
		[ProgramType.PriceModel4, 2],
		[ProgramType.PriceModel5, 3],
	]);
	export const ProtocolCodeValue = new Map<ProtocolCode, number>([
		[ProtocolCode.UnknownProtocol, 0],
		[ProtocolCode.ISO9141_1, 1],
		[ProtocolCode.ISO9141_2, 2],
		[ProtocolCode.KwipSlowInit, 4],
		[ProtocolCode.KwipFastInit, 8],
		[ProtocolCode.PWM, 16],
		[ProtocolCode.VPWM, 32],
		[ProtocolCode.CAN_11_250kbits, 64],
		[ProtocolCode.CAN_11_500kbits, 128],
		[ProtocolCode.CAN_29_250kbits, 256],
		[ProtocolCode.CAN_29_500kbits, 512],
		[ProtocolCode.CAN, 1001],
		[ProtocolCode.ISO, 1002],
		[ProtocolCode.KWP, 1003],
		[ProtocolCode.VPW, 1004],
		[ProtocolCode.J1939, 1024],
		[ProtocolCode.KW1281, 2048],
		[ProtocolCode.KW71, 2049],
		[ProtocolCode.KW81, 4096],
		[ProtocolCode.KW82, 4097],
		[ProtocolCode.ALDL, 8192],
	]);
	export const RegistrationStatusUpdateActionValue = new Map<RegistrationStatusUpdateAction, number>([
		[RegistrationStatusUpdateAction.None, 0],
		[RegistrationStatusUpdateAction.Enable, 1],
		[RegistrationStatusUpdateAction.Inactive, 2],
		[RegistrationStatusUpdateAction.Unlock, 3],
	]);
	export const StatesValue = new Map<States, number>([
		[States.AL, 1],
		[States.AK, 2],
		[States.AR, 3],
		[States.AZ, 4],
		[States.CA, 5],
		[States.CO, 6],
		[States.CT, 7],
		[States.DC, 8],
		[States.DE, 9],
		[States.FL, 10],
		[States.GA, 11],
		[States.HI, 12],
		[States.IA, 13],
		[States.ID, 14],
		[States.IL, 15],
		[States.IN, 16],
		[States.KS, 17],
		[States.KY, 18],
		[States.LA, 19],
		[States.MA, 20],
		[States.MD, 21],
		[States.ME, 22],
		[States.MI, 23],
		[States.MN, 24],
		[States.MO, 25],
		[States.MS, 26],
		[States.MT, 27],
		[States.NC, 28],
		[States.ND, 29],
		[States.NE, 30],
		[States.NH, 31],
		[States.NJ, 32],
		[States.NM, 33],
		[States.NV, 34],
		[States.NY, 35],
		[States.OK, 36],
		[States.OH, 37],
		[States.OR, 38],
		[States.PA, 39],
		[States.RI, 40],
		[States.SC, 41],
		[States.SD, 42],
		[States.TN, 43],
		[States.TX, 44],
		[States.UT, 45],
		[States.VA, 46],
		[States.VT, 47],
		[States.WA, 48],
		[States.WI, 49],
		[States.WV, 50],
		[States.WY, 51],
	]);
	export const StopShipmentMethodValue = new Map<StopShipmentMethod, number>([
		[StopShipmentMethod.SetMonitoringComplete, 0],
		[StopShipmentMethod.OptOut, 1],
	]);
	export const TelematicsFeaturesValue = new Map<TelematicsFeatures, number>([
		[TelematicsFeatures.AccidentDetection, 0],
		[TelematicsFeatures.Snapshot, 1],
	]);
	export const UnenrollReasonValue = new Map<UnenrollReason, number>([
		[UnenrollReason.DeviceNotEligible, 1],
		[UnenrollReason.DriverAdded, 2],
		[UnenrollReason.DriverLicenseChange, 3],
		[UnenrollReason.DriverNotEligible, 4],
		[UnenrollReason.DriverStatusChange, 5],
		[UnenrollReason.ExpireNonPay, 6],
		[UnenrollReason.NonCommunicator, 7],
		[UnenrollReason.NonInstaller, 8],
		[UnenrollReason.PolicyCancel, 9],
		[UnenrollReason.UserInitiated, 10],
        [UnenrollReason.VehicleAdded, 11],
        [UnenrollReason.DriverDeleted, 12],
	]);
	export const UserAccessValue = new Map<UserAccess, number>([
		[UserAccess.Eligibility, 0],
		[UserAccess.InsertInitialParticipationScoreInProcess, 1],
		[UserAccess.OptOutSuspension, 2],
		[UserAccess.PolicyMerge, 3],
		[UserAccess.ResetEnrollment, 4],
		[UserAccess.StopShipment, 5],
		[UserAccess.UpdatePProGuid, 6],
		[UserAccess.VehicleSupport, 7],
	]);
	export const UserRolesValue = new Map<UserRoles, number>([
		[UserRoles.OpsAdmin, 0],
		[UserRoles.OpsUser, 1],
		[UserRoles.SupportAdmin, 2],
		[UserRoles.Theft, 3],
		[UserRoles.MobileRegistrationAdmin, 4],
		[UserRoles.ChangeAppAssignment, 5],
		[UserRoles.FeeReversal, 6],
		[UserRoles.CommercialLineRole, 7],
	]);

