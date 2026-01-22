using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Shared;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.TripInformation;
public class Trip
{
    public int TripSeqID { get; set; }
    public DateTime? TripStartDateTime { get; set; }
    public DateTime? TripEndDateTime { get; set; }
    public int? IdleTime { get; set; }
    public string ReportedVehicleVIN { get; set; }
    public int? ReportedVehicleProtocolCode { get; set; }
    public int? VehicleSeqID { get; set; }
    public int? DeviceSeqID { get; set; }
    public int ParticipantSeqID { get; set; }
    public DateTime? CreateDateTime { get; set; }
    public bool? AudioOn { get; set; }
    public decimal? TripKilometers { get; set; }

    public decimal? TripMiles
    {
        get
        {
            return (TripKilometers ?? 0) * Constants.ConversionConstants.KilometersToMiles;
        }
    }

    public decimal? MaxSpeedKPH { get; set; }
    public int? HardAccelerations { get; set; }
    public int? HardBrakes { get; set; }
    public int? ExtremeAccelerations { get; set; }
    public int? ExtremeBrakes { get; set; }
    public int? MilesSinceCheckEngineLightReset { get; set; }
    public int? TimeSpeedBand1 { get; set; }
    public int? TimeSpeedBand2 { get; set; }
    public int? TimeSpeedBand3 { get; set; }
    public int? TimeAboveSpeedCeiling { get; set; }
    public int? RiskLevel1HardBrakeCount { get; set; }
    public int? RiskLevel2HardBrakeCount { get; set; }
    public int? RiskLevel3HardBrakeCount { get; set; }
    public int? RiskLevel1ExtremeBrakeCount { get; set; }
    public int? RiskLevel2ExtremeBrakeCount { get; set; }
    public int? RiskLevel3ExtremeBrakeCount { get; set; }
    public int? UnreasonableTripCode { get; set; }
    public int? HardBrakeV2Count { get; set; }
    public int? HardAccelerationV2Count { get; set; }
    public int? ExtremeBrakeHighJerkCount { get; set; }
    public int? ExtremeBrakeMedJerkCount { get; set; }
    public int? ExtremeBrakeLowJerkCount { get; set; }
    public int? HighRiskSeconds { get; set; }
    public string MobileScoringDataObj { get; set; }
    public string MobileTripID { get; set; }
    public long? TripStartTimestamp { get; set; }
    public int? TripStartTimeZoneOffsetNbr { get; set; }
    public long? TripEndTimestamp { get; set; }
    public int? TripEndTimeZoneOffsetNbr { get; set; }

    public string TripDurationString
    {
        get
        {
            if (TripEndDateTime.HasValue && TripStartDateTime.HasValue)
            {
                var duration = (TripEndDateTime.Value - TripStartDateTime.Value);
                return $"{(int)duration.TotalHours:D2}:{duration.Minutes:D2}:{duration.Seconds:D2}";
            }

            return null;
        }
    }

    public TimeSpan? TripDuration => TripEndDateTime.HasValue && TripStartDateTime.HasValue
        ? TripEndDateTime.Value - TripStartDateTime.Value
        : null;
}
