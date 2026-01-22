using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfXirgoService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IXirgoDeviceService
    {
        Task<GetDeviceBySerialNumberResponse> GetDeviceBySerialNumber(GetDeviceBySerialNumberRequest getDeviceBySerialNumberRequest);
        Task<GetDeviceBySimResponse> GetDeviceBySim(GetDeviceBySimRequest getDeviceBySimNumberRequest);
        Task<ReturnDeviceResponse> ProcessDeviceReturn(ReturnDeviceRequest returnDeviceRequest);
        Task<UpdateDeviceAudioBySerialNumberResponse> UpdateDeviceAudio(string serialNumber, bool isAudoEnabled);
        Task<GetDeviceAudioBySerialNumberResponse> GetDeviceAudioBySerialNumber(string serialNumber);
        Task<ActivateDeviceResponse> ActivateXirgoDevice(string serialNumber, string SIM, bool isSIMActive);
        Task<GetDeviceInfoResponse> XirgoDeviceInformation(string serialNumber);
        Task<GetDeviceFeaturesResponse> DeviceFeatures(string serialNumber);
        Task<PingDeviceResponse> PingDevice(string serialNumber);
        Task<ResetDeviceResponse> ResetDevice(string serialNumber);
        Task<GetDevicesByLotResponse> GetDevicesByLot(int lotSeqId, DeviceLotType lotType);
        Task<GetDeviceBySerialNumberResponse> GetDeviceBySerialNumber(string serialNumber);
        Task<GetDeviceBySimResponse> GetDeviceBySim(string sim);    
        Task<UpdateDeviceResponse> UpdateXirgoDevice(int deviceSeqId, DeviceStatus status, DeviceLocation location);
    }

    public class XirgoDeviceService : WcfService<XirgoServiceClient>, IXirgoDeviceService
    {
        public XirgoDeviceService(ILogger<XirgoDeviceService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateXirgoServiceClient) { }

        public async Task<GetDeviceBySerialNumberResponse> GetDeviceBySerialNumber(GetDeviceBySerialNumberRequest getDeviceBySerialNumberRequest)
        {
            using var client = CreateClient();
            var response = await client.GetDeviceBySerialNumberAsync(getDeviceBySerialNumberRequest);
            return response;
        }

        public async Task<GetDeviceBySimResponse> GetDeviceBySim(GetDeviceBySimRequest getDeviceBySimNumberRequest)
        {
            using var client = CreateClient();
            var response = await client.GetDeviceBySimAsync(getDeviceBySimNumberRequest);
            return response;
        }
        public async Task<ReturnDeviceResponse> ProcessDeviceReturn(ReturnDeviceRequest returnDeviceRequest)
        {
            using var client = CreateClient();
            var response = await client.ProcessDeviceReturnAsync(returnDeviceRequest);
            return response;
        }

        public async Task<UpdateDeviceAudioBySerialNumberResponse> UpdateDeviceAudio(string serialNumber, bool isAudoEnabled)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateDeviceAudioBySerialNumberAsync(new UpdateDeviceAudioBySerialNumberRequest
            {
                DeviceSerialNumber = serialNumber,
                TurnAudioOn = isAudoEnabled
            }), logger);
            return response;
        }

        public async Task<GetDeviceAudioBySerialNumberResponse> GetDeviceAudioBySerialNumber(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceAudioBySerialNumberAsync(new GetDeviceAudioBySerialNumberRequest
            {
                SerialNumber = serialNumber
            }), logger);
            return response;
        }

        public async Task<ActivateDeviceResponse> ActivateXirgoDevice(string serialNumber, string SIM, bool isSIMActive)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.ActivateDeviceAsync(new ActivateDeviceRequest
            {
                Device = new XirgoDevice
                {
                    DeviceSerialNumber = serialNumber,
                    SIM = SIM,
                    IsSimActive = isSIMActive
                }
            }), logger);
            return response;
        }

        public async Task<GetDeviceInfoResponse> XirgoDeviceInformation(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceInfoAsync(new GetDeviceInfoRequest
            {
                SerialNumber = serialNumber
            }), logger);
            return response;
        }

        public async Task<GetDeviceFeaturesResponse> DeviceFeatures(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceFeaturesAsync(new GetDeviceFeaturesRequest
            {
                SerialNumber = serialNumber
            }), logger);
            return response;
        }

        public async Task<PingDeviceResponse> PingDevice(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.PingDeviceAsync(new PingDeviceRequest
            {
                SerialNumber = serialNumber
            }), logger, "Could not ping device");
            return response;
        }

        public async Task<ResetDeviceResponse> ResetDevice(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.ResetDeviceAsync(new ResetDeviceRequest
            {
                SerialNumber = serialNumber
            }), logger);
            return response;
        }

        public async Task<GetDevicesByLotResponse> GetDevicesByLot(int lotSeqId, DeviceLotType lotType)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDevicesInLotAsync(new GetDevicesByLotRequest
            {
                LotSeqID = lotSeqId,
                LotTypeCode = (int)lotType
            }), logger);
            return response;
        }

        public async Task<GetDeviceBySerialNumberResponse> GetDeviceBySerialNumber(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceBySerialNumberAsync(new GetDeviceBySerialNumberRequest
            {
                SerialNumber = serialNumber
            }), logger);
            return response;
        }

        public async Task<GetDeviceBySimResponse> GetDeviceBySim(string sim)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceBySimAsync(new GetDeviceBySimRequest
            {
                SIM = sim
            }), logger);
            return response;
        }

        public async Task<UpdateDeviceResponse> UpdateXirgoDevice(int deviceSeqId, DeviceStatus status, Business.Resources.Enums.DeviceLocation location)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.UpdateAsync(new UpdateDeviceRequest
            {
                Device = new XirgoDevice
                {
                    DeviceSeqID = deviceSeqId,
                    StatusCode = (int)status,
                    LocationCode = (int)location
                }
            }), logger);
            return response;
        }
    }
}

