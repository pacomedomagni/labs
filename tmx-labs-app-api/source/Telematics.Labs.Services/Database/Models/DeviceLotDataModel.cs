using System;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class DeviceLotDataModel
    {
        public string Name { get; set; }
        public int LotSeqID { get; set; }
        public DateTime? CreateDateTime { get; set; }
        public int? StatusCode { get; set; }
        public int? TypeCode { get; set; }
    }
}
