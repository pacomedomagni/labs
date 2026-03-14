using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.InteropServices;

namespace Progressive.Telematics.Admin.Business.Resources.Cl;

public class RemoveOptOutRequest
{
    [Required]
    public string PolicyNumber { get; set; }

    [Required]
    public int ParticipantSeqId { get; set; }
    public bool UpdatedHeavyTruckFlag { get; set; }
    public string? UpdatedCableType { get; set; }

    public Boolean RemoveOptOut { get; set; } = true;
    public int PolicySeqId { get; set; }
    public int VehicleSeqId { get; set; }
    public bool IsCableOrderInd { get; set; }
}
