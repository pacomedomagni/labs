using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Services.Models.UbiDTO;
public class TripSummaryDTO
{
    public long TripSeqID { get; set; }
    public DateTime TripStartTime { get; set; }
    public DateTime TripEndTime { get; set; }
    public int TripDuration { get; set; }
    public decimal TripMileage { get; set; }
    public byte MaxSpeed { get; set; }
    public int HardBrakes { get; set; }
    public int ExtremeBrakes { get; set; }
    public DateTime? CreateDate { get; set; }
    public int HardBrakesV2 { get; set; }
    public int HardAccelerationsV2 { get; set; }
    public int HighRiskSeconds { get; set; }
}
