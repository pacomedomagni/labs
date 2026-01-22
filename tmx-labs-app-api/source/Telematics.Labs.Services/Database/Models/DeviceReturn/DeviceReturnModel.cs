using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Database.Models.DeviceReturn
{
    public class DeviceReturnModel
    {
        public int DeviceSeqID { get; set; }
        public int ParticipantSeqID { get; set; }
        public DateTime CreateDateTime { get; set; }
        public int DeviceReturnReasonCode { get; set; }
        public int VehicleSeqID { get; set; }
        public DateTime? DeviceReceivedDateTime = null;
        public DateTime? DeviceAbandonedDateTime = null;
    }
}
