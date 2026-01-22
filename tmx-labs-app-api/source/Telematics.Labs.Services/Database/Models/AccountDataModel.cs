using System;
using System.Collections.Generic;
using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Services.Database.Models;

public class AccountDataModel
{
    public int ParticipantSeqID { get; set; }
    public int ParticipantGroupSeqID { get; set; }
    public int? VehicleSeqID { get; set; }
    public int? DeviceSeqID { get; set; }
    public int? ParticipantStatusCode { get; set; }
    public int? ScoreCalculatorCode { get; set; }
    public DateTime? LastUpdateDateTime { get; set; }
    public DateTime? ParticipantCreateDateTime { get; set; }
    public string Nickname { get; set; }
    public int? ScoringAlgorithmCode { get; set; }
    public int? DriverSeqId { get; set; }
    public string ParticipantExternalID { get; set; }
    public int? MobileSummarizerVersionCode { get; set; }
    public int? DeviceExperienceTypeCode { get; set; }
    public string ParticipantId { get; set; }
    public string VIN { get; set; }
    public int? Year { get; set; }
    public string Make { get; set; }
    public string Model { get; set; }
    public DateTime? VehicleCreateDateTime { get; set; }
    public string DriverExternalId { get; set; }
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
    public int? IsActive { get; set; }
    public IList<DeviceFeature> Features { get; set; }
}
