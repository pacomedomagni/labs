import { ParticipantStatus } from "../participant/enums";
import { DeviceExperience, DeviceLocation, DeviceReturnReasonCode, DeviceStatus } from "./enums";

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
  [DeviceReturnReasonCode.ManualMonitoringComplete, "Manual Monitoring Complete"],
]);

export const DeviceStatusDescription = new Map<DeviceStatus, string>([
  [DeviceStatus.Available, "Available"],
  [DeviceStatus.Inactive, "Inactive"],
  [DeviceStatus.Assigned, "Assigned"],
  [DeviceStatus.Abandoned, "Abandoned"],
  [DeviceStatus.CustomerReturn, "Customer Return"],
  [DeviceStatus.Unavailable, "Unavailable"],
  [DeviceStatus.Defective, "Defective"],
  [DeviceStatus.Batched, "Batched"],
  [DeviceStatus.ReadyForPrep, "Ready for Prep"],
  [DeviceStatus.ReadyForBenchTest, "Ready for Bench Test"],
]);


export const DeviceExperienceDescription = new Map<DeviceExperience, string>([
  [DeviceExperience.Device, "Device"],
  [DeviceExperience.Mobile, "Mobile"],
  [DeviceExperience.OEM, "OEM"],
]);

export const DeviceLocationDescription = new Map<DeviceLocation, string>([
  [DeviceLocation.Progressive, "Progressive"],
  [DeviceLocation.Distributor, "Distributor"],
  [DeviceLocation.ShippedFromMfgtoDist, "Shipped from manufacturer to distributor"],
  [DeviceLocation.ShippedFromPrgtoDist, "Shipped from Progressive to distributor"],
  [DeviceLocation.ShippedToCustomer, "Shipped to customer"],
  [DeviceLocation.InVehicle, "In vehicle"],
  [DeviceLocation.Unknown, "Unknown"],
]);

export const ParticipantStatusLabels = new Map<number, string>([
    [1, ParticipantStatus.Enrolled],
    [2, ParticipantStatus.OptOut],
]);