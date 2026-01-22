using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Device;
public class MarkDefectiveRequest
{
    public string DeviceSerialNumber { get; set; }
    public int ParticipantSequenceId { get; set; }
}
