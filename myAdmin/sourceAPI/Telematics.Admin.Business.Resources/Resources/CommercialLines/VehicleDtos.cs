using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Business.Resources.Cl;

public class VehicleDto
{
    public int ParticipantSeqId { get; set; }
    public int PolicySeqId { get; set; }
    public int VehicleSeqId { get; set; }
    public string Vin { get; set; }
    public bool? IsHeavyTruck { get; set; }
}

public class VehicleUpdateDto
{
    public int VehicleSeqId { get; set; }
    public bool? IsHeavyTruck { get; set; }
    public string CableType { get; set; }
}
