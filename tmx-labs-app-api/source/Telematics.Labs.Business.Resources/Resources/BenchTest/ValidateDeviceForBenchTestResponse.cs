using Progressive.Telematics.Labs.Business.Resources.Shared;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.BenchTest
{
    public class ValidateDeviceForBenchTestResponse : Resource
    {
        public bool SimActive { get; set; }
        public bool IsAssigned { get; set; }

    }
}
