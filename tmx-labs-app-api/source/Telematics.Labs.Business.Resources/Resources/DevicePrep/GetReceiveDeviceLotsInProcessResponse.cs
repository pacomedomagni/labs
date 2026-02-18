using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class GetReceiveDeviceLotsInProcessResponse : Resource
{
    public DeviceLot[] DeviceLots { get; set; }
    public int DeviceLotCount { get; set; }
    public int RequiredPercentage { get; set; }
}
