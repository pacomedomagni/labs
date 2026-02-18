using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class GetDevicesByLotResponse : Resource
{
    public DeviceDetails[] Devices { get; set; }
    public int DeviceCount { get; set; }
}
