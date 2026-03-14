using System;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class SimManagementRecord
    {
        public string SIM { get; set; }
        public DateTime EffectiveDate { get; set; }
        public int Action { get; set; }
        public string NewRecordStatus { get; set; }
    }
}
