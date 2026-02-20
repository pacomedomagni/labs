/* tslint:disable:max-line-length */

import {
	CancelDeviceReplacementAction,
	DeviceExperience,
	DeviceLotStatus,
	DeviceReturnReasonCode,
	MobileRegistrationStatus,
	MobileRegistrationStatusSummary,
	OptOutReasonCode,
	ParticipantReasonCode,
	ParticipantStatus,
	ProgramCode,
	ProgramType,
	States,
	StopShipmentMethod,
	TelematicsFeatures,
	UnenrollReason
} from "./enums";

export const DeviceExperienceDescription = new Map<DeviceExperience, string>([
	[DeviceExperience.Device, "Device"],
	[DeviceExperience.Mobile, "Mobile"],
	[DeviceExperience.OEM, "OEM"]
]);

export const DeviceLotStatusDescription = new Map<DeviceLotStatus, string>([
	[DeviceLotStatus.ShippedToDistributor, "Shipped To Distributor"],
	[DeviceLotStatus.ShipmentReceivedByDistributor, "Shipment Received By Distributor"],
	[DeviceLotStatus.AssigningDevices, "Assigning Devices"],
	[DeviceLotStatus.UsedForTest, "Used for Test"],
	[DeviceLotStatus.ShippedToManufacturer, "Shipped To Manufacturer"],
	[DeviceLotStatus.ShipmentReceivedByManufacturer, "Shipment Received By Manufacturer"],
	[DeviceLotStatus.AssignedToRMA, "Assigned To RMA"],
	[DeviceLotStatus.Storage, "Storage"],
	[DeviceLotStatus.Obsolete, "Obsolete"]
]);

export const DeviceReturnReasonCodeDescription = new Map<DeviceReturnReasonCode, string>([
	[DeviceReturnReasonCode.OptOut, "OptOut"],
	[DeviceReturnReasonCode.Cancel, "Cancel"],
	[DeviceReturnReasonCode.NonInstaller, "Non Installer"],
	[DeviceReturnReasonCode.DeviceReplaced, "Device was replaced"],
	[DeviceReturnReasonCode.CustomerReturn, "Customer Return"],
	[DeviceReturnReasonCode.DeviceProblem, "Device Problem"],
	[DeviceReturnReasonCode.DeviceRefused, "Device was refused"],
	[DeviceReturnReasonCode.DeviceUnclaimed, "Device was unclaimed"],
	[DeviceReturnReasonCode.MarkedReturned, "Marked Returned to Sender"],
	[DeviceReturnReasonCode.DeviceUndeliverable, "Device was undeliverable"],
	[DeviceReturnReasonCode.Abandoned, "Abandoned"],
	[DeviceReturnReasonCode.NonCommunicator, "Non Communicator"],
	[DeviceReturnReasonCode.DiscountQualified, "Qualified for Discount"],
	[DeviceReturnReasonCode.DiscountDisqualified, "Did Not Qualify for Discount"],
	[DeviceReturnReasonCode.ManualMonitoringComplete, "Manual Monitoring Complete"]
]);

export const MobileRegistrationStatusDescription = new Map<MobileRegistrationStatus, string>([
	[MobileRegistrationStatus.Disabled, "Disabled"],
	[MobileRegistrationStatus.Inactive, "Inactive"],
	[MobileRegistrationStatus.PendingResolution, "Pending Resolution"],
	[MobileRegistrationStatus.Locked, "Locked"],
	[MobileRegistrationStatus.NotRegistered, "Not Registered (New)"],
	[MobileRegistrationStatus.ChallengeInProcess, "Challenge In Process"],
	[MobileRegistrationStatus.ChallegeError, "Challenge Error"],
	[MobileRegistrationStatus.ChallengeComplete, "Challenge Complete"],
	[MobileRegistrationStatus.Authenticated, "Mobile Registration is Authenticated"],
	[MobileRegistrationStatus.VehicleSelectionComplete, "Vehicle Selection Complete"],
	[MobileRegistrationStatus.ServerVerifyComplete, "Server Verify Complete"],
	[MobileRegistrationStatus.RegistrationCompleteInProcess, "Registration Complete In Process"],
	[MobileRegistrationStatus.RegistrationCompleteError, "Registration Complete Error"],
	[MobileRegistrationStatus.RegistrationComplete, "Registration Complete"]
]);

export const MobileRegistrationStatusSummaryDescription = new Map<MobileRegistrationStatusSummary, string>([
	[MobileRegistrationStatusSummary.New, "New"],
	[MobileRegistrationStatusSummary.Inactive, "Inactive"],
	[MobileRegistrationStatusSummary.PendingResolution, "Pending Resolution"],
	[MobileRegistrationStatusSummary.Disabled, "Disabled"],
	[MobileRegistrationStatusSummary.Locked, "Locked"],
	[MobileRegistrationStatusSummary.Complete, "Complete"],
]);

export const OptOutReasonCodeDescription = new Map<OptOutReasonCode, string>([
	[OptOutReasonCode.CustomerOptOut, "Customer Opt Out"],
	[OptOutReasonCode.Cancel, "Cancel"],
	[OptOutReasonCode.DriverDelete, "Driver Delete"],
	[OptOutReasonCode.VehicleDelete, "Vehicle Delete"],
	[OptOutReasonCode.NonInstaller, "Non Installer"],
	[OptOutReasonCode.NonCommunicator, "Non Communicator"],
	[OptOutReasonCode.NotFitMilesTrips, "Not Fit Miles Trips"],
	[OptOutReasonCode.NotFitCategoryChangePct, "Not Fit Category Change Pct"],
	[OptOutReasonCode.MonitoringComplete, "Monitoring Complete"],
	[OptOutReasonCode.NotCompleteTwoTerms, "Not Complete Two Terms"]
]);

export const ParticipantReasonCodeDescription = new Map<ParticipantReasonCode, string>([
	[ParticipantReasonCode.ParticipantOptedOut, `Participant opted out`],
	[ParticipantReasonCode.PolicyCanceled, `Policy canceled`],
	[ParticipantReasonCode.RenewalWorkCreated, `Renewal work created`],
	[ParticipantReasonCode.CollectingData, `Collecting data`],
	[ParticipantReasonCode.NeedsDeviceAssigned, `Needs device assigned`],
	[ParticipantReasonCode.DeviceReplacementNeeded, `Device replacement needed`],
	[ParticipantReasonCode.FlatDelete, `Flat delete`],
	[ParticipantReasonCode.DeviceReturnedAutomatedOptOutInProcess, `Device was returned, automated Opt Out in process`],
	[ParticipantReasonCode.AutomatedOptOutEndorsementPending, `Automated Opt Out endorsement pending`],
	[ParticipantReasonCode.AutomatedOptInEndorsementPending, `Automated Opt In endorsement pending`],
	[ParticipantReasonCode.MobilePendingRegistration, `Mobile Pending Registration`]
]);

export const ParticipantStatusDescription = new Map<ParticipantStatus, string>([
	[ParticipantStatus.Active, "Active"],
	[ParticipantStatus.Inactive, "Inactive"],
	[ParticipantStatus.Pending, "Pending"],
	[ParticipantStatus.Renewal, "Renewal"],
	[ParticipantStatus.Unenrolled, "Un-enrolled"]
]);

export const ProgramCodeDescription = new Map<ProgramCode, string>([
	[ProgramCode.Unknown, "Unknown"],
	[ProgramCode.Snapshot, "Policy"],
	[ProgramCode.Trial, "Trial"],
	[ProgramCode.Labs, "Labs"]
]);

export const ProgramTypeDescription = new Map<ProgramType, string>([
	[ProgramType.PriceModel2, "Snapshot 2.0"],
	[ProgramType.PriceModel3, "Snapshot 3.0"],
	[ProgramType.PriceModel4, "Snapshot 4.0"],
	[ProgramType.PriceModel5, "Snapshot 5.0"]
]);

export const StatesDescription = new Map<States, { abbreviation: string; name: string }>([
	[States.AL, { abbreviation: "AL", name: "Alabama" }],
	[States.AK, { abbreviation: "AK", name: "Alaska" }],
	[States.AR, { abbreviation: "AR", name: "Arkansas" }],
	[States.AZ, { abbreviation: "AZ", name: "Arizona" }],
	[States.CA, { abbreviation: "CA", name: "California" }],
	[States.CO, { abbreviation: "CO", name: "Colorado" }],
	[States.CT, { abbreviation: "CT", name: "Connecticut" }],
	[States.DC, { abbreviation: "DC", name: "District of Columbia" }],
	[States.DE, { abbreviation: "DE", name: "Delaware" }],
	[States.FL, { abbreviation: "FL", name: "Florida" }],
	[States.GA, { abbreviation: "GA", name: "Georgia" }],
	[States.HI, { abbreviation: "HI", name: "Hawaii" }],
	[States.IA, { abbreviation: "IA", name: "Iowa" }],
	[States.ID, { abbreviation: "ID", name: "Idaho" }],
	[States.IL, { abbreviation: "IL", name: "Illinois" }],
	[States.IN, { abbreviation: "IN", name: "Indiana" }],
	[States.KS, { abbreviation: "KS", name: "Kansas" }],
	[States.KY, { abbreviation: "KY", name: "Kentucky" }],
	[States.LA, { abbreviation: "LA", name: "Louisiana" }],
	[States.MA, { abbreviation: "MA", name: "Massachusetts" }],
	[States.MD, { abbreviation: "MD", name: "Maryland" }],
	[States.ME, { abbreviation: "ME", name: "Maine" }],
	[States.MI, { abbreviation: "MI", name: "Michigan" }],
	[States.MN, { abbreviation: "MN", name: "Minnesota" }],
	[States.MO, { abbreviation: "MO", name: "Missouri" }],
	[States.MS, { abbreviation: "MS", name: "Mississippi" }],
	[States.MT, { abbreviation: "MT", name: "Montana" }],
	[States.NC, { abbreviation: "NC", name: "North Carolina" }],
	[States.ND, { abbreviation: "ND", name: "North Dakota" }],
	[States.NE, { abbreviation: "NE", name: "Nebraska" }],
	[States.NH, { abbreviation: "NH", name: "New Hampshire" }],
	[States.NJ, { abbreviation: "NJ", name: "New Jersey" }],
	[States.NM, { abbreviation: "NM", name: "New Mexico" }],
	[States.NV, { abbreviation: "NV", name: "Nevada" }],
	[States.NY, { abbreviation: "NY", name: "New York" }],
	[States.OK, { abbreviation: "OK", name: "Oklahoma" }],
	[States.OH, { abbreviation: "OH", name: "Ohio" }],
	[States.OR, { abbreviation: "OR", name: "Oregon" }],
	[States.PA, { abbreviation: "PA", name: "Pennsylvania" }],
	[States.RI, { abbreviation: "RI", name: "Rhode Island" }],
	[States.SC, { abbreviation: "SC", name: "South Carolina" }],
	[States.SD, { abbreviation: "SD", name: "South Dakota" }],
	[States.TN, { abbreviation: "TN", name: "Tennessee" }],
	[States.TX, { abbreviation: "TX", name: "Texas" }],
	[States.UT, { abbreviation: "UT", name: "Utah" }],
	[States.VA, { abbreviation: "VA", name: "Virginia" }],
	[States.VT, { abbreviation: "VT", name: "Vermont" }],
	[States.WA, { abbreviation: "WA", name: "Washington" }],
	[States.WI, { abbreviation: "WI", name: "Wisconsin" }],
	[States.WV, { abbreviation: "WV", name: "West Virginia" }],
	[States.WY, { abbreviation: "WY", name: "Wyoming" }]
]);

export const StopShipmentDescription = new Map<StopShipmentMethod, string>([
	[StopShipmentMethod.OptOut, "Set to Opted Out"],
	[StopShipmentMethod.SetMonitoringComplete, "Set to Monitoring Complete"]
]);

export const CancelDeviceReplacementActionDescription = new Map<CancelDeviceReplacementAction, string>([
	[CancelDeviceReplacementAction.OptOut, "Set to Opted Out"],
	[CancelDeviceReplacementAction.PreviousDeviceActive, "Set to Active"]
]);

export const TelematicsFeaturesDescription = new Map<TelematicsFeatures, string>([
	[TelematicsFeatures.AccidentDetection, "Accident Response"],
	[TelematicsFeatures.Snapshot, "Snapshot"]
]);

export const UnenrollReasonDescription = new Map<UnenrollReason, string>([
	[UnenrollReason.DeviceNotEligible, "Device Not Eligible"],
	[UnenrollReason.DriverAdded, "Driver Added"],
	[UnenrollReason.DriverDeleted, "Driver Deleted"],
	[UnenrollReason.DriverLicenseChange, "Driver License Change"],
	[UnenrollReason.DriverNotEligible, "Driver Not Eligible"],
	[UnenrollReason.DriverStatusChange, "Driver Status Change"],
	[UnenrollReason.ExpireNonPay, "Expired - Non Pay"],
	[UnenrollReason.NonCommunicator, "Non-Communicator"],
	[UnenrollReason.NonInstaller, "Non-Installer"],
	[UnenrollReason.PolicyCancel, "Policy Cancel"],
	[UnenrollReason.UserInitiated, "User Initiated"],
	[UnenrollReason.VehicleAdded, "Vehicle Added"]
]);
/* tslint:enable:max-line-length */
