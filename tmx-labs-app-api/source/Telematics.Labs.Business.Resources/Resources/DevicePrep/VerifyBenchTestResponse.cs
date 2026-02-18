using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class VerifyBenchTestResponse : Resource
{
    public int TotalDevices { get; set; }
    public int SuccessfulUpdates { get; set; }
    public int FailedUpdates { get; set; }
    public DeviceUpdateResult[] Results { get; set; }
}

[TsClass]
public class DeviceUpdateResult
{
    public string DeviceSerialNumber { get; set; }
    public bool Success { get; set; }
    public string ErrorMessage { get; set; }
}
