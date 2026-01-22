using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

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
