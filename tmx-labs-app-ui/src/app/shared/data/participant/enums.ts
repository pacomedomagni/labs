export enum ParticipantReasonCode {
	None = "None",
	ParticipantOptedOut = "ParticipantOptedOut",
	PolicyCanceled = "PolicyCanceled",
	RenewalWorkCreated = "RenewalWorkCreated",
	CollectingData = "CollectingData",
	NeedsDeviceAssigned = "NeedsDeviceAssigned",
	DeviceReplacementNeeded = "DeviceReplacementNeeded",
	FlatDelete = "FlatDelete",
	DeviceReturnedAutomatedOptOutInProcess = "DeviceReturnedAutomatedOptOutInProcess",
	AutomatedOptOutEndorsementPending = "AutomatedOptOutEndorsementPending",
	AutomatedOptInEndorsementPending = "AutomatedOptInEndorsementPending",
	MobilePendingRegistration = "MobilePendingRegistration"
}
export enum ParticipantStatus {
	Enrolled = "Enrolled",
	Active = "Active",
	Inactive = "Inactive",
	Pending = "Pending",
	Renewal = "Renewal",
	OptOut = "OptOut",
	Unenrolled = "Unenrolled"
}

export enum OptOutReasonCode {
	CustomerOptOut = "CustomerOptOut",
	Cancel = "Cancel",
	DriverDelete = "DriverDelete",
	VehicleDelete = "VehicleDelete",
	NonInstaller = "NonInstaller",
	NonCommunicator = "NonCommunicator",
	NotFitMilesTrips = "NotFitMilesTrips",
	NotFitCategoryChangePct = "NotFitCategoryChangePct",
	MonitoringComplete = "MonitoringComplete",
	NotCompleteTwoTerms = "NotCompleteTwoTerms"
}

export enum UnenrollReason {
	DeviceNotEligible = "DeviceNotEligible",
	DriverAdded = "DriverAdded",
	DriverDeleted = "DriverDeleted",
	DriverLicenseChange = "DriverLicenseChange",
	DriverNotEligible = "DriverNotEligible",
	DriverStatusChange = "DriverStatusChange",
	ExpireNonPay = "ExpireNonPay",
	NonCommunicator = "NonCommunicator",
	NonInstaller = "NonInstaller",
	PolicyCancel = "PolicyCancel",
	UserInitiated = "UserInitiated",
	VehicleAdded = "VehicleAdded"
}