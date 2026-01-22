using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn
{
    public class GetDeviceReturnModel
    {
        public int DeviceSeqID { get; set; }
        public int ParticipantSeqID { get; set; }
    }
}
