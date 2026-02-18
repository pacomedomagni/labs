using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

public class GetDevicesByLotRequest
{
    public int LotSeqId { get; set; }
    public DeviceLotType LotType { get; set; }
}
