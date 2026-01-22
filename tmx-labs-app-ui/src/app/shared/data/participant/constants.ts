import { ParticipantReasonCode, ParticipantStatus, UnenrollReason } from "./enums";

export const ParticipantReasonCodeDescription = new Map<ParticipantReasonCode, string>([
  [ParticipantReasonCode.ParticipantOptedOut, "Participant opted out"],
  [ParticipantReasonCode.PolicyCanceled, "Policy canceled"],
  [ParticipantReasonCode.RenewalWorkCreated, "Renewal work created"],
  [ParticipantReasonCode.CollectingData, "Collecting data"],
  [ParticipantReasonCode.NeedsDeviceAssigned, "Needs device assigned"],
  [ParticipantReasonCode.DeviceReplacementNeeded, "Device replacement needed"],
  [ParticipantReasonCode.FlatDelete, "Flat delete"],
  [ParticipantReasonCode.DeviceReturnedAutomatedOptOutInProcess, "Device was returned, automated Opt Out in process"],
  [ParticipantReasonCode.AutomatedOptOutEndorsementPending, "Automated Opt Out endorsement pending"],
  [ParticipantReasonCode.AutomatedOptInEndorsementPending, "Automated Opt In endorsement pending"],
  [ParticipantReasonCode.MobilePendingRegistration, "Mobile Pending Registration"],
]);

export const ParticipantStatusDescription = new Map<ParticipantStatus, string>([
  [ParticipantStatus.Active, "Active"],
  [ParticipantStatus.Inactive, "Inactive"],
  [ParticipantStatus.Pending, "Pending"],
  [ParticipantStatus.Renewal, "Renewal"],
  [ParticipantStatus.Unenrolled, "Un-enrolled"],
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
	[UnenrollReason.DriverDeleted, 12]
]);

export const ParticipantStatusValue = new Map<ParticipantStatus, number>([
    [ParticipantStatus.Enrolled, 1],
    [ParticipantStatus.OptOut, 2],
]);