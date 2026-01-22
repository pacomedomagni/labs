using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class ScoringAlgorithmDataModel
    {
        public int Code { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreateDateTime { get; set; }
        public int OBD2SummarizerCode { get; set; }
        public int MobileSummarizerCode { get; set; }
        public int OBD2ValueCalculatorCode { get; set; }
        public int? InvalidDistractedDrivingCode { get; set; }
        public int MobileValueCalculatorCode { get; set; }
        public bool RatedDistractedDrivingInd { get; set; }
    }
}
