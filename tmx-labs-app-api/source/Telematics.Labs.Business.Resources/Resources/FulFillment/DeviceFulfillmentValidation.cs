using System.Runtime.CompilerServices;
using Progressive.Telematics.Labs.Business.Resources.Resources.Device;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.FulFillment
{
    public class DeviceFulfillmentValidation
    {
        public DeviceFulfillmentValidation(string deviceSerialNumber)
        {
            DeviceSerialNumber = deviceSerialNumber;
            IsExistent = false;
            IsBenchtested = false;
            IsAssigned = false;
            IsAvailable = false;
        }
        public bool IsValid => IsExistent && !string.IsNullOrEmpty(DeviceSerialNumber) && IsBenchtested && !IsAssigned && IsAvailable;
        public bool IsExistent { get; set; }
        public bool IsBenchtested { get; set; }
        public bool IsAssigned { get; set; }
        public string DeviceSerialNumber { get; set; }
        public bool IsAvailable { get; set; }
    }
}
