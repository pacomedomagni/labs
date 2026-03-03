using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using WcfDevice;

namespace Progressive.Telematics.Admin.Services.Wcf
{
    [SingletonService]
    public interface IDeviceService
    {
        Task<ActivateResponse> ActivateDevice(string policyNumber, string serialNumber);
        Task<GetDeviceDetailsResponse> DeviceInformation(string serialNumber);
        Task<DeviceReplaceResponse> ReplaceDevice(string policyNumber, int participantSeqId);
        Task<DefectiveResponse> MarkDeviceDefective(string policyNumber, string serialNumber);
        Task<SwapResponse> SwapDevice(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId);
        Task<AbandonResponse> MarkDeviceAbandoned(string policyNumber, int participantSeqId, string serialNumber, short? policySuffix, short? expirationYear);
        Task<CancelDeviceReplaceResponse> CancelDeviceReplacement(string policyNumber, int participantSeqId);
        Task<FeeReversalResponse> FeeReversal(string deviceSerialNumber, short? expirationYear, int participantSeqID, string policyNumber, short? policySuffix);
        Task<GetDeviceHistoryResponse> GetDeviceHistory(string serialNumber);
    }

    public class DeviceService : WcfService<DeviceServiceClient>, IDeviceService
    {
        private readonly IHttpContextAccessor contextAccessor;

        public DeviceService(ILogger<DeviceService> logger, IWcfServiceFactory factory, IHttpContextAccessor contextAccessor)
            : base(logger, factory.CreateDeviceClient)
        {
            this.contextAccessor = contextAccessor;
        }

        public async Task<ActivateResponse> ActivateDevice(string policyNumber, string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.ActivateAsync(new ActivateRequest
            {
                DeviceSerialNumber = serialNumber,
                PolicyNumber = policyNumber,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<GetDeviceDetailsResponse> DeviceInformation(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceAsync(new GetDeviceDetailsRequest
            {
                DeviceSerialNumber = serialNumber
            }), logger);
            return response;
        }

        public async Task<DeviceReplaceResponse> ReplaceDevice(string policyNumber, int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.DeviceReplaceAsync(new DeviceReplaceRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqID = participantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<DefectiveResponse> MarkDeviceDefective(string policyNumber, string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.MarkDefectiveAsync(new DefectiveRequest
            {
                PolicyNumber = policyNumber,
                DeviceSerialNumber = serialNumber,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<SwapResponse> SwapDevice(string policyNumber, int srcParticipantSeqId, int destParticipantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.SwapDevicesAsync(new SwapRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqID1 = srcParticipantSeqId,
                ParticipantSeqID2 = destParticipantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<AbandonResponse> MarkDeviceAbandoned(string policyNumber, int participantSeqId, string serialNumber, short? policySuffix, short? expirationYear)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.AbandonAsync(new AbandonRequest
            {
                DeviceSerialNumber = serialNumber,
                ExpirationYear = expirationYear,
                ParticipantSeqID = participantSeqId,
                PolicyNumber = policyNumber,
                PolicySuffix = policySuffix,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<CancelDeviceReplaceResponse> CancelDeviceReplacement(string policyNumber, int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.CancelDeviceReplaceAsync(new CancelDeviceReplaceRequest
            {
                PolicyNumber = policyNumber,
                ParticipantSeqID = participantSeqId,
                UserName = contextAccessor.CurrentUser()
            }), logger);
            return response;
        }

        public async Task<FeeReversalResponse> FeeReversal(string deviceSerialNumber, short? expirationYear, int participantSeqID, string policyNumber, short? policySuffix)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.FeeReversalAsync(new FeeReversalRequest
            {
                DeviceSerialNumber = deviceSerialNumber,
                ExpirationYear = expirationYear,
                ParticipantSeqID = participantSeqID,
                PolicyNumber = policyNumber,
                PolicySuffix = policySuffix,
                UserName = contextAccessor.CurrentUser()
            }), logger, "Policy not found in billing history");
            return response;
        }

        public async Task<GetDeviceHistoryResponse> GetDeviceHistory(string serialNumber)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDeviceHistoryAsync(new GetDeviceHistoryRequest
            {
                DeviceSerialNumber = serialNumber
            }), logger);
            return response;
        }
    }
}
