using System;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class DeviceLocationInfo : Resource
{
    public DateTime? LocationDate { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
}

