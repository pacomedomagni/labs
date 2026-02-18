using System;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class DeviceLot : Resource
{

    public DateTime? CreateDateTime { get; set; }

    public DateTime CreateDate 
    { 
        get => CreateDateTime ?? DateTime.MinValue;
        set => CreateDateTime = value;
    }

    public int? LotSeqID { get; set; }

    public int? SeqId 
    { 
        get => LotSeqID;
        set => LotSeqID = value;
    }

    public string Name { get; set; }

    public int? StatusCode { get; set; }

    public DeviceLotStatus Status 
    { 
        get => (DeviceLotStatus)(StatusCode ?? 0);
        set => StatusCode = (int)value;
    }

    public int? TypeCode { get; set; }

    public DeviceLotType Type 
    { 
        get => (DeviceLotType)(TypeCode ?? 0);
        set => TypeCode = (int)value;
    }
}

