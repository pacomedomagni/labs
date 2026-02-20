using System;

namespace Progressive.Telematics.Admin.Services.Models.UbiDTO;
public class ParticipantJunctionDTO
{
    public string SystemName { get; set; }
    public int? ParticipantSeqID { get; set; }
    public Guid? ParticipantID { get; set; }
    public string ParticipantExternalID { get; set; }
    public int? DeviceExperienceTypeCode { get; set; }
    public string MobileDeviceAliasName { get; set; }
    public int? PolicyPeriodSeqID { get; set; }
    public int PolicySuffix { get; set; }
    public int? ExpirationYear { get; set; }
    public DateTime? InceptionDate { get; set; }
    public DateTime? ExpirationDate { get; set; }
    public string RateRevision { get; set; }
    public int? VehicleSeqID { get; set; }
    public string YMM { get; set; }
    public string VIN { get; set; }
    public int? DeviceSeqID { get; set; }
    public string DeviceSerialNumber { get; set; }
    public int? HomeBaseDeviceSeqID { get; set; }
    public string PendingDeviceSerialNumber { get; set; }
    public int? JunctionVersion { get; set; }
    public int? JunctionVersionSeq { get; set; }
    public DateTime ChangeEffectiveDate { get; set; }
    public string Status { get; set; }
    public int? ReasonCode { get; set; }
    public int? ScoringAlgorithmCode { get; set; }
    public int? DriverSeqID { get; set; }
}
