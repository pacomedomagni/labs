using Progressive.Telematics.Labs.Business.Resources.Enums;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

public class VerifyBenchTestRequest
{
    public int LotSeqId { get; set; }
    public DeviceLotType LotType { get; set; }
}
