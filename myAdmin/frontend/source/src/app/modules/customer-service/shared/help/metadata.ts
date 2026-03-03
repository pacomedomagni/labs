import { HelpTextData } from "@modules/shared/data/applications-help-text";
import { CUI_DIALOG_WIDTH } from "@pgr-cla/core-ui-components";
import { HelpTextType } from "@modules/core/types/help-text.enum";
import { StopShipmentHelpComponent } from "./stop-shipment/stop-shipment-help.component";
import { MobileRegistrationHelpComponent } from "./mobile-registration/mobile-registration-help.component";
import { MobileRegistrationResetHelpComponent } from "./mobile-registration-reset/mobile-registration-reset-help.component";
import { helpText as ineligibleVehicleHelpText } from "../../tools/ineligible-vehicles/metadata";

export enum HelpText {
	ActivateDevice = "Activate Device",
	AudioChange = "Set Audio",
	AudioManage = "Manage Audio",
	CancelDeviceReplacement = "Cancel Device Replacement",
	ChallengeExpired = "Challenge Expired",
	Compatibility = "Add Compatibility Issue",
	ConnectionTimeline = "Connection Timeline",
	DeviceLocation = "Device Location",
	DeviceLocationUTCTime = "Device UTC Time",
	DeviceLocationTimeZone = "Device Time Zone",
	DeviceMarkAbandoned = "Mark Abandoned",
	DeviceMarkDefective = "Mark Defective",
	DeviceRecovery = "Device Recovery",
	DeviceReplace = "Replace Device",
	DeviceSwap = "Swap Devices",
	EnrollmentDateAlert = "Enrollment Date Alert",
	EnrollmentDateChange = "Change Enrollment Date",
	ExcludedDateRange = "Excluded Date Range",
	InitialDiscount = "Initial Discount",
	MobileConnectivity = "Mobile Connectivity",
	MobileNumberChange = "Change Mobile Phone Number",
	MobileReEnroll = "Re-Enroll in Mobile",
	MobileRegistration = "Mobile Registration",
	MobileRegistrationInactivate = "Inactivate Mobile Registration",
	MobileRegistrationAlert = "Mobile Registration Alert",
	MobileRegistrationPending = "Mobile Registration Pending",
	MobileRegistrationReset = "Mobile Registration Reset",
	MobileRegistrationUnlock = "Unlock Mobile Registration",
	OptOutReasonForPlugin = "Opt OutReason For Plugin",
	OptOutReasonForMobile = "Opt OutReason For Mobile",
	OptOutSuspension = "Opt Out Suspension",
	PolicyDetails = "Edit Policy Details",
	PolicyExpired = "Policy Expired",
	ProgramType = "Program Type",
	RemoteReset = "Remote Reset",
	RenewalScoreHistory = "Renewal Score History",
	WirelessStatus = "Wireless Status",
	StopShipment = "Stop Shipment",
	SwapDrivers = "Swap Drivers",
	SwitchMobileToOBD = "Switch Mobile to Plug-in",
	TrialMigration = "Trial Migration",
	TripSummary = "Trip Summary",
	UBIValue = "UBI Value",
	UnenrollParticipant = "Unenroll Participant",
	DeviceStatus = "Device Status"
}

export const helpText: Map<string, HelpTextData> = new Map<string, HelpTextData>([
	[
		HelpText.ActivateDevice,
		{
			type: HelpTextType.Help,
			width: CUI_DIALOG_WIDTH.MEDIUM,
			content: `<p>'Activate Device' will complete the following actions:</p>
			<ul class="mb-0">
				<li>Update the device's Wireless Status from 'Inactive-' to 'Active-', if not already 'Active-'</li>
				<li>Send request to turn on trip collection</li>
				<li>Delete any existing device recovery requests</li>
				<li>Clear the Abandon Date field, if the device was abandoned</li>
			</ul>
			`
		}
	],
	[
		HelpText.AudioChange,
		{
			type: HelpTextType.Help,
			content: `<p>'Set Audio' allows you to turn on and off the audio tones that play on plug-in devices during the following events:</p>
			<ul>
				<li>Trip Start</li>
				<li>Hard Brake</li>
				<li>Extreme Brake</li>
				<li>Trip End</li>
			</ul>
			<p>By default, the device audio is set to 'On'.</p>
			`
		}
	],
	[
		HelpText.AudioManage,
		{
			type: HelpTextType.Help,
			content: `<p>'Manage Audio' allows you to turn on and off the audio tones that play on plug-in devices during the following events:</p>
			<ul>
				<li>Trip Start</li>
				<li>Hard Brake</li>
				<li>Extreme Brake</li>
				<li>Trip End</li>
			</ul>
			<p>By default, the device audio is set to 'On'.</p>
			`
		}
	],
	[
		HelpText.CancelDeviceReplacement,
		{
			type: HelpTextType.Help,
			width: CUI_DIALOG_WIDTH.MEDIUM,
			content: `<p>'Cancel Device Replacement’ cancels the device shipment request and updates the both the participant's and the device’s Status based on the selection made:</p>
			<ul>
				<li>‘Set to Active’ will update the participant's Reason Code to 'Collecting Data (11)' and re-activate the device that was previously assigned.</li>
				<li>‘Set to Opted Out’ will update the participant's Status to ‘Inactive’, the Reason Code to 'Participant Opted Out (1)', and deactivate the device that was previously assigned (unless the device has already been abandoned).</li>
			</ul>`
		}
	],
	[
		HelpText.ChallengeExpired,
		{
			type: HelpTextType.Notification,
			content: "Challenge Code Expired"
		}
	],
	[
		HelpText.Compatibility,
		{
			type: HelpTextType.Help,
			content: `'Add Compatibility Issue' allows you to log the details of a plug-in or mobile device compatibility issue as well as document the action taken as a result of the issue.`
		}
	],
	[
		HelpText.ConnectionTimeline,
		{
			type: HelpTextType.Help,
			content: `'Connection Timeline' allows you to view connect and disconnect events for plug-in devices.`
		}
	],
	[
		HelpText.DeviceLocation,
		{
			type: HelpTextType.Help,
			content: `'Device Location' allows you to view a plug-in participant's device location information to assist with theft recovery efforts.`
		}
	],
	[
		HelpText.DeviceLocationUTCTime,
		{
			type: HelpTextType.Help,
			content: `'Device UTC Time' device location time stamps are in UTC time and will need adjusted to the local time zone of the location of the device.`
		}
	],
	[
		HelpText.DeviceLocationTimeZone,
		{
			type: HelpTextType.Help,
			content: `'Device Time Zone' device location time stamps are the local time zone of the location of the device.`
		}
	],
	[
		HelpText.DeviceMarkAbandoned,
		{
			type: HelpTextType.Help,
			content: `<p>'Mark Abandoned' allows you to:</p>
			<ul class="mb-0">
				<li>Indicate when a plug-in device is lost or unrecoverable</li>
				<li>Ensure customer is not charged a Non Returned Device Fee (if one has not already been charged)</li>
				<li>Prevent future device return request communications from being sent to the customer</li>
			</ul>
			`
		}
	],
	[
		HelpText.DeviceMarkDefective,
		{
			type: HelpTextType.Help,
			content: `'Mark Defective' allows you to set the device's Wireless Status to 'Inactive-Defective' to ensure that the device will be removed from circulation and sent back to the manufacturer to be refurbished or destroyed.`
		}
	],
	[
		HelpText.DeviceRecovery,
		{
			type: HelpTextType.Help,
			content: `<p>'Device Recovery' allows you to:</p>
			<ul>
				<li>Suspend recovery of a plug-in device for 14 days</li>
				<li>Abandon a device that has already been replaced</li>
			</ul>
			<p><b>NOTE:</b> Communications will not be sent for length of the device recovery suspension period.</p>
			`
		}
	],
	[
		HelpText.DeviceReplace,
		{
			type: HelpTextType.Help,
			content: `'Replace Device' allows you to request a new plug-in device be assigned and shipped to the selected participant.`
		}
	],
	[
		HelpText.DeviceSwap,
		{
			type: HelpTextType.Help,
			content: `'Swap Devices' allows you to swap device assignments between two vehicles.`
		}
	],
	[
		HelpText.EnrollmentDateAlert,
		{
			type: HelpTextType.Alert,
			content: `Enrollment Date is not set.<br/><br/>Please use 'Change Enrollment Date' to set the participant's enrollment date.`
		}
	],
	[
		HelpText.EnrollmentDateChange,
		{
			type: HelpTextType.Help,
			width: CUI_DIALOG_WIDTH.MEDIUM,
			content: `<p>'Change Enrollment Date' allows you to modify the current Enrollment Date or<br/>add an Enrollment Date if one is not already set.</p><br/>
			<p><b>NOTES:</b></p>
			<ul class="mb-0">
				<li>If the Enrollment Date is not set, trips will not display in any reports.</li>
				<li>Trips collected prior to the Enrollment Date will not be used in the calculation of the participant's UBI Value nor will they display in any reports.</li>
				<li>If participant switched from mobile to plug-in, do not reset their enrollment date to prior to device shipment date as this will cause system issues when calculating a customer's UBI Value.</li>
			</ul>
			`
		}
	],
	[
		HelpText.ExcludedDateRange,
		{
			type: HelpTextType.Help,
			content: `'Excluded Date Range' excludes trip data for a given date range so that the data is not used in the calculation of the participant's UBI Value.<br/><br/>
			Upon adding an excluded date range, online trip reports and results calculations (i.e. Trip Summary, Trip Details, UBI Value) will no longer include trip data for the excluded date range.`
		}
	],
	[
		HelpText.InitialDiscount,
		{
			type: HelpTextType.Help,
			content: `<p>'Initial Discount' allows you to determine if the selected participant has earned an Initial Discount.</p>
			<ul class="mb-0">
				<li>If an Initial Discount has been earned, review the Initial Discount Score table for more details.</li>
				<li>If monitoring is still in process, review the Initial Discount In Process table to determine when the participant is expected to earn their Initial Discount.</li>
			</ul>
			`
		}
	],
	[
		HelpText.MobileConnectivity,
		{
			type: HelpTextType.Help,
			content: `'Mobile Connectivity' allows you to view the last 6 months of data collected through mobile heartbeats.<br/><br/>
			See the <a href="http://knowledgemanagement/Help/Document/Services_MobileconnectivityPH" target="_blank">Mobile Connectivity guidelines</a> for more information about how you can use this data to troubleshoot connectivity issues.
			`
		}
	],
	[
		HelpText.MobileNumberChange,
		{
			type: HelpTextType.Help,
			width: CUI_DIALOG_WIDTH.MEDIUM,
			content: `<p>'Change Mobile Phone Number' will complete the following actions:</p>
			<ul>
				<li>Update the phone number</li>
				<li>Set the Mobile Registration Status to the most applicable to the participant's circumstances</li>
			</ul>
			<p>If a Road Test or Labs registration is active for the phone number entered, then an overridable warning will fire.  Selecting 'OK' will execute the following actions:</p>
			<ul>
				<li>Set Road Test or Labs participant's Mobile Registration Status to 'Inactive'</li>
				<li>Update the phone number</li>
				<li>Set Mobile Registration Status on the policy to 'Not Registered (New)'</li>
			</ul>
			<p>If the phone number is active on another policy, the Mobile Registration Status will be updated to 'Pending Resolution'.  See <a href="http://domino1/pssowb.nsf/owbref/Snapshotdupmobreg" target="_blank">Duplicate Mobile Registration Guidelines</a>.</p>
			`
		}
	],
	[
		HelpText.MobileReEnroll,
		{
			type: HelpTextType.Help,
			width: CUI_DIALOG_WIDTH.MEDIUM,
			content: `<p>'Re-Enroll in Mobile' will complete the following actions:</p>
			<ul>
				<li>Update the device experience from plug-in to mobile</li>
				<li>Set the participant's Status to 'Active and Reason Code to 'Collecting Data (11)'</li>
				<li>Set the participant's Mobile Registration Status to 'Not Registered (New)'</li>
			</ul>
			<p>If the Mobile Registration Status for this participant is in 'Pending Resolution', the 'Re-Enroll in Mobile' action will fail. See <a href="http://domino1/pssowb.nsf/owbref/Snapshotdupmobreg" target="_blank">Duplicate Mobile Registration Guidelines</a> in order to resolve the issue with the Mobile Registration Status prior to attempting to 'Re-Enroll in Mobile'.</p>
			`
		}
	],
	[
		HelpText.MobileRegistration,
		{
			title: "Mobile Registration Status Codes",
			content: MobileRegistrationHelpComponent,
			width: CUI_DIALOG_WIDTH.LARGE
		}
	],
	[
		HelpText.MobileRegistrationAlert,
		{
			type: HelpTextType.Alert,
			content: `This Registration Status is not permitted on an Active participant.
			<br></br>The following actions can enable registration. If the first option does not enable the registration, try the second.
			<br></br>1. Select 'Reset' from the Mobile Registration link.
			<br></br>2. Select 'Change Mobile Phone Number' and re-enter the phone number that is already listed.`
		}
	],
	[
		HelpText.MobileRegistrationInactivate,
		{
			type: HelpTextType.Help,
			content: `<p>'Inactivate' will complete the following actions:</p>
			<ul class="mb-0">
				<li>Update Mobile Registration Status to 'Inactive'</li>
				<li>If another registration with the same phone number exists in the Mobile Registration Status of 'Pending Resolution', it will be automatically set to 'Not Registered – New'.</li>
			</ul>
			`
		}
	],
	[
		HelpText.MobileRegistrationPending,
		{
			type: HelpTextType.Alert,
			content: `The phone number listed on this participant's registration is being (or has been) used on another policy.<br/><br/>See <a href="http://domino1/pssowb.nsf/owbref/Snapshotdupmobreg" target="_blank">Duplicate Mobile Registration Guidelines</a> in order to resolve.`
		}
	],
	[
		HelpText.MobileRegistrationUnlock,
		{
			type: HelpTextType.Help,
			content: `<p>'Unlock' allows you to update a participant's registration from the status of 'Locked' to the status most applicable to their circumstances.</p><br/>
			<p>Mobile Registration Status is set to 'Locked' after the customer enters 5 invalid challenge codes during the Snapshot Mobile Registration process.</p>`
		}
	],
	[
		HelpText.OptOutReasonForPlugin,
		{
			type: HelpTextType.Notification,
			content: "If the customer plugs in their device, the system will automatically re-enroll the customer within 24 hours."
		}
	],
	[
		HelpText.OptOutReasonForMobile,
		{
			type: HelpTextType.Notification,
			content: "If the customer registers their mobile device, the system will automatically re-enroll the customer within 24 hours."
		}
	],
	[
		HelpText.OptOutSuspension,
		{
			type: HelpTextType.Help,
			content: `<p>'Opt Out Suspension' allows you to delay a customer from being automatically opted out as a non-installer/non-communicator for a specified amount of time (default is 14 days).</p><br/>
			<p>You also have the ability to cancel all current and future opt out suspensions.</p><br/>
			<p><b>NOTE:</b> Communications will continue to be sent during the opt out suspension period.</p>
			`
		}
	],
	[
		HelpText.PolicyDetails,
		{
			type: HelpTextType.Help,
			content: `'Edit Policy Details' allows you to update the mailing address used for shipment of the customer's plug-in device.`
		}
	],
	[
		HelpText.PolicyExpired,
		{
			type: HelpTextType.Notification,
			content: "Policy is Expired"
		}
	],
	[
		HelpText.ProgramType,
		{
			type: HelpTextType.Help,
			externalUrl: "https://progressiveinsurance.sharepoint.com/sites/CRMSnapshotHome/SiteAssets/Forms/AllItems.aspx?id=%2Fsites%2FCRMSnapshotHome%2FSiteAssets%2FGraphics%2FSnapshot%20Versions%20at%20a%20Glance%2Epdf&parent=%2Fsites%2FCRMSnapshotHome%2FSiteAssets%2FGraphics"
		}
	],
	[
		HelpText.RemoteReset,
		{
			type: HelpTextType.Help,
			content: `'Remote Reset' allows you to reset a plug-in device remotely so that the customer does not have to manually reset the device.`
		}
	],
	[
		HelpText.RenewalScoreHistory,
		{
			type: HelpTextType.Help,
			content: `'Renewal Score History' allows you to review the Snapshot data that is sent to PolicyPro at each renewal.`
		}
	],
	[
		HelpText.StopShipment,
		{
			title: "Stop Shipment Options",
			content: StopShipmentHelpComponent,
			width: CUI_DIALOG_WIDTH.MEDIUM
		}
	],
	[
		HelpText.SwapDrivers,
		{
			type: HelpTextType.Help,
			content: `'Swap Drivers' allows you to swap driver assignments between two vehicles that are enrolled in Mobile 3.0 and have completed registration.`
		}
	],
	[
		HelpText.SwitchMobileToOBD,
		{
			type: HelpTextType.Help,
			content: `<p>'Switch Plug-in to Mobile' will complete the following actions:</p>
			<ul>
				<li>Update the device experience from mobile to plug-in</li>
				<li>Set the participant's Status to 'Pending' and Reason Code to 'Pending Device Assignment (14)'</li>
				<li>Set the participant's Mobile Registration Status to 'Disabled'</li>
				<li>Reset the participant's Enrollment Date to now</li>
			</ul>
			<p><b>NOTE:</b> The Enrollment Date should <b>NOT</b> be reset back to the original date as this would cause system issues when calculating a customer's UBI Value.</p>
			`
		}
	],
	[
		HelpText.WirelessStatus,
		{
			type: HelpTextType.Alert,
			content: `<p>An Abandoned device is not permitted on an Active participant as no trips will be collected.</p><br/>
			<p>Please complete one of the following actions:</p>
			<ul class="mb-0">
				<li>Activate the device</li>
				<li>Replace the device</li>
				<li>Opt Out in PolicyPro</li>
			</ul>
			`
		}
	],
	[
		HelpText.MobileRegistrationReset,
		{
			title: "Reset Mobile Registration Status",
			content: MobileRegistrationResetHelpComponent,
			width: CUI_DIALOG_WIDTH.LARGE
		}
	],
	[
		HelpText.TrialMigration,
		{
			type: HelpTextType.Notification,
			content: "Customer started in Road Test or Test Drive"
		}
	],
	[
		HelpText.TripSummary,
		{
			type: HelpTextType.Help,
			content: `<p>'Trip Summary' allows you to review trip data collected:</p>
			<ul class="mb-0">
				<li>After the participant's Enrollment Date</li>
				<li>Within the past year</li>
				<li>Not inside an Excluded Date Range</li>
			</ul>
			`
		}
	],
	[
		HelpText.UBIValue,
		{
			type: HelpTextType.Help,
			content: `<p>'UBI Value' allows you to review the most up to date UBI Value, Connected Days, and Disconnected Days for the selected participant.</br></br>
			These values are calculated using data collected:</p>
			<ul class="mb-0">
				<li>After the participant's Enrollment Date</li>
				<li>Within the past year</li>
				<li>Not inside an Excluded Date Range</li>
			</ul>
			`
		}
	],
	[
		HelpText.UnenrollParticipant,
		{
			type: HelpTextType.Help,
			width: CUI_DIALOG_WIDTH.LARGE,
			content: `<p>'Unenroll Participant' will complete the following actions:</br>
						</p>
			<ul class="mb-0">
				<li>Remove the selected participant from Accident Response.</li>
				<li>Send a single email communication advising that the participant is opted out of Accident Response.</li>
				<li>Turn off all future communications regarding Accident Response for that participant.</li>
			</ul>

			

			<p>Note: </br> </p>
			<ul class="mb-0">
				<li>If the participant is enrolled in BOTH Snapshot Mobile and Accident Response, this feature will not unenroll
				the participant from Snapshot and the Registration Status will remain the same.</li>
			</ul>
			`
		}
	],
	[
		HelpText.DeviceStatus,
		{
			type: HelpTextType.Help,
			content: `<p>Device Status indicates whether or not a Mobile device is collecting data for Accident Detection.</p> 
			<p>Status will remain 'Inactive' until Customer agrees to Terms & Conditions</p>
			`
		}
	],
	...ineligibleVehicleHelpText
]);
