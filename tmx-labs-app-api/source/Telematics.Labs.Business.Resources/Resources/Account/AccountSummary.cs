using System;
using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Account;

public class AccountSummary : Resource
{
    public AccountSummary()
    {
        Participant = new ParticipantSummary();
        Vehicle = new VehicleSummary();
        Device = new DeviceSummary();
        Driver = new DriverSummary();
    }

    public ParticipantSummary Participant { get; set; }
    public VehicleSummary Vehicle { get; set; }
    public DeviceSummary Device { get; set; }
    public DriverSummary Driver { get; set; }
}

public class ParticipantSummary
{
    public int ParticipantSeqID { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public int? ParticipantStatusCode { get; set; }
    public int? ScoreCalculatorCode { get; set; }
    public int? ScoringAlgorithmCode { get; set; }
    public DateTime? LastUpdateDateTime { get; set; }
    public DateTime? ParticipantCreateDateTime { get; set; }
    public string ParticipantExternalID { get; set; }
    public string ParticipantId { get; set; }
    public DeviceOrderDetails OpenDeviceOrder { get; set; }
}

public class VehicleSummary
{
    public int? VehicleSeqID { get; set; }
    public string VIN { get; set; }
    public int? Year { get; set; }
    public string Make { get; set; }
    public string Model { get; set; }
    public DateTime? VehicleCreateDateTime { get; set; }
}

public class DeviceSummary
{
    public int? DeviceSeqID { get; set; }
    public int? DeviceExperienceTypeCode { get; set; }
    public string DeviceSerialNumber { get; set; }
    public string SIM { get; set; }
    public int? DeviceStatusCode { get; set; }
    public int? DeviceLocationCode { get; set; }
    public string DeviceManufacturer { get; set; }
    public string DeviceTypeDescription { get; set; }
    public string ReportedVIN { get; set; }
    public DateTime? DeviceShipDateTime { get; set; }
    public DateTime? FirstContactDateTime { get; set; }
    public DateTime? LastContactDateTime { get; set; }
    public DateTime? LastUploadDateTime { get; set; }
    public DateTime? DeviceReceivedDateTime { get; set; }
    public int? DeviceReturnReasonCode { get; set; }
    public DateTime? DeviceAbandonedDateTime { get; set; }
    public IList<DeviceFeature> Features { get; set; }
}

public class DriverSummary
{
    public int? DriverSeqId { get; set; }
    public string DriverExternalId { get; set; }
    public string Nickname { get; set; }
    public int? MobileSummarizerVersionCode { get; set; }
}
