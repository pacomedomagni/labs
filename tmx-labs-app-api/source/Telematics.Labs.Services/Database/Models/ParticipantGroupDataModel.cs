using System;

namespace Progressive.Telematics.Labs.Services.Database.Models
{
    public class ParticipantGroupDataModel
    {
        public int ParticipantGroupSeqID { get; set; }
        public string ParticipantGroupExternalKey { get; set; }
        public DateTime CreateDateTime { get; set; }
        public int ParticipantGroupType { get; set; }
    }
}
