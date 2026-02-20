using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources.Resources.Shared;

[TsClass]
public class TrackingNumber : Resource
{
    public int TrackingNumberSeqId { get; set; }
    public string? UspsReturnTrackingNumber { get; set; }

    public string? UspsShipTrackingNumber { get; set; }
}
