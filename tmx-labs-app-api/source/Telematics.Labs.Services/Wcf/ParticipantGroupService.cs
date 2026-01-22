using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Business.Resources.Enums;
using Progressive.Telematics.Labs.Shared.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ParticipantGroupService;
using WcfEligibleZipCodesService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IParticipantGroupService
    {
        Task<GetPartGroupByExtKeyResponse> GetPartGroupByExtKey(string participantGroupExternalKey);
    }

    public class ParticipantGroupService : WcfService<ParticipantGroupServiceClient>, IParticipantGroupService
    {
        public ParticipantGroupService(ILogger<ParticipantGroupService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateParticipantGroupServiceClient) { }

        public async Task<GetPartGroupByExtKeyResponse> GetPartGroupByExtKey(string participantGroupExternalKey)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetPartGroupByExtKeyAsync(new GetPartGroupByExtKeyRequest()
            {
                ParticipantGroupExternalKey = participantGroupExternalKey
            }), logger, "Unable to get participant group");
            return response;
        }
    }
}
