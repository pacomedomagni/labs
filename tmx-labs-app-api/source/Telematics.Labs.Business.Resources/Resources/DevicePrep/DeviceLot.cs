using System;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class DeviceLot : Resource
{
    public DateTime CreateDate { get; set; }
    public int? SeqId { get; set; }
    public string Name { get; set; }
    public DeviceLotStatus Status { get; set; }
    public DeviceLotType Type { get; set; }

}

