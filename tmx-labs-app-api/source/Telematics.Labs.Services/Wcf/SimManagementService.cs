using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WcfParticipantService;
using WcfSimManagementService;
using WcfXirgoSessionService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface ISimManagementService
    {
        Task<AddSimManagementResponse> Add(AddSimManagementRequest req);
    }

    public class SimManagementService : WcfService<SimManagementServiceClient>, ISimManagementService
    {
        public SimManagementService(ILogger<UserManagementService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateSimManagementServiceClient)
        {

        }

        public async Task<AddSimManagementResponse> Add(AddSimManagementRequest req)
        {
            await using var client = CreateClient();
            return await client.HandledCall(() => client.AddAsync(req), logger);
        }
    }
}
