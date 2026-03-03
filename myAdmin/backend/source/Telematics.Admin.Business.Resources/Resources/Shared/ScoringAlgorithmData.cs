using System;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Resources.Shared
{
    [TsClass]
	public class ScoringAlgorithmData : Resource
	{
		public int Code { get; set; }
		public string Description { get; set; }
		public bool IsActive { get; set; }
		public DateTime CreateDateTime { get; set; }
		public int OBD2SummarizerCode { get; set; }
		public int MobileSummarizerCode { get; set; }
		public int OBD2ValueCalculatorCode { get; set; }
		public int MobileValueCalculatorCode { get; set; }
		public int RatedDistractedDrivingInd { get; set; }
		public int? InvalidDistractedDrivingCode { get; set; }
	}
}
