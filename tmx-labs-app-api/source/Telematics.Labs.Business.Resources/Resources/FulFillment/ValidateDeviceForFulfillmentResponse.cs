using System.Runtime.CompilerServices;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment
{
    public class ValidateDeviceForFulfillmentResponse : Resource
    {
        public ValidateDeviceForFulfillmentResponse(string deviceSerialNumber)
        {
            DeviceSerialNumber = deviceSerialNumber;
            IsExistent = false;
            IsBenchtested = false;
            IsAssigned = false;
        }
        public bool IsValid => IsExistent && !string.IsNullOrEmpty(DeviceSerialNumber) && IsBenchtested && !IsAssigned;
        public bool IsExistent { get; set; }
        public bool IsBenchtested { get; set; }
        public bool IsAssigned { get; set; }
        public string DeviceSerialNumber { get; set; }
    }
}
