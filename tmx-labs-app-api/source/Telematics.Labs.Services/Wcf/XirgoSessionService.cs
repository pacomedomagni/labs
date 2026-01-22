using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfXirgoSessionService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IXirgoSessionService
    {
        Task<GetXirgoSessionResponse> GetDeviceLocation(string serialNumber, DateTime lastContactDate);
    }

    public class XirgoSessionService : WcfService<XirgoSessionServiceClient>, IXirgoSessionService
    {
        public XirgoSessionService(ILogger<XirgoSessionService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateXirgoSessionServiceClient) { }

        public async Task<GetXirgoSessionResponse> GetDeviceLocation(string serialNumber, DateTime lastContactDate)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetByDateAndDeviceSerialNumberAsync(new GetXirgoSessionByDateAndDeviceSerialNumberRequest
            {
                DeviceSerialNumber = serialNumber,
                EndDateTime = lastContactDate,
                StartDateTime = lastContactDate.AddDays(-30)
            }), logger);
            return response;
        }
    }
}

