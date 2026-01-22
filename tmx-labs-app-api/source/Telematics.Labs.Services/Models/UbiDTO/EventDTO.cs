using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Progressive.Telematics.Labs.Services.Models.UbiDTO;
public class EventDTO
{
    public int EventSeqID { get; set; }
    public DateTime EventTime { get; set; }
    public string EventDescription { get; set; }
    public byte? EventCode { get; set; }
    public short? ProtocolCode { get; set; }
    public string VIN { get; set; }
    public int? OdometerReading { get; set; }
    public DateTime? CreateDate { get; set; }
}

