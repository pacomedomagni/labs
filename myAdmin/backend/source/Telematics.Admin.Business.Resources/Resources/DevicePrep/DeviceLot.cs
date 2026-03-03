using System;
using System.Collections.Generic;
using System.Text;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources
{
    [TsClass]
    public class DeviceLot : Resource
    {
        public DateTime CreateDate { get; set; }
        public int? SeqId { get; set; }
        public string Name { get; set; }
        public DeviceLotStatus Status { get; set; }
        public DeviceLotType Type { get; set; }

    }
}
