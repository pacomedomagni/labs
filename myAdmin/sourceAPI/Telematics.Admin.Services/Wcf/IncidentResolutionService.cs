using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using WcfIncidentResolutionService;

namespace Progressive.Telematics.Admin.Services.Wcf
{
    [SingletonService]
    public interface IIncidentResolutionService
    {
        Task<GetIncidentResolutionsResponse> Get();
        Task<InsertIncidentResolutionResponse> Add(IncidentResolution incidentResolution);
        Task<UpdateIncidentResolutionResponse> Update(IncidentResolution incidentResolution);
        Task<DeleteIncidentResolutionResponse> Delete(IncidentResolution incidentResolution);
        Task<ExecuteIncidentResolutionResponse> Execute(string kbaId, string storedProcedureName, SPParameter[] spParameters);
        Task<GetSPParametersResponse> GetStoredProcedureParameters(string storedProcedureName);
    }

    public class IncidentResolutionService : WcfService<IncidentResolutionServiceClient>, IIncidentResolutionService
    {
        private readonly IHttpContextAccessor contextAccessor;

        public IncidentResolutionService(ILogger<IncidentResolutionService> logger, IWcfServiceFactory factory, IHttpContextAccessor contextAccessor)
            : base(logger, factory.CreateIncidentResolutionClient)
        {
            this.contextAccessor = contextAccessor;
        }

        public async Task<GetIncidentResolutionsResponse> Get()
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() =>
                client.GetIncidentResolutionsAsync(new GetIncidentResolutionsRequest()),
                logger,
                "Could not retrieve incident resolutions");
            return response;
        }

        public async Task<InsertIncidentResolutionResponse> Add(IncidentResolution incidentResolution)
        {
            incidentResolution.LastChangeUserId = contextAccessor.CurrentUser();
            using var client = CreateClient();
            var response = await client.HandledCall(() =>
                client.InsertIncidentResolutionAsync(new InsertIncidentResolutionRequest { IncidentResolution = incidentResolution }),
                logger,
                "Update IncidentResolution failed");
            return response;
        }

        public async Task<UpdateIncidentResolutionResponse> Update(IncidentResolution incidentResolution)
        {
            incidentResolution.LastChangeUserId = contextAccessor.CurrentUser();
            using var client = CreateClient();
            var response = await client.HandledCall(() =>
                client.UpdateIncidentResolutionAsync(new UpdateIncidentResolutionRequest { IncidentResolution = incidentResolution }),
                logger,
                "Update IncidentResolution failed");
            return response;
        }

        public async Task<DeleteIncidentResolutionResponse> Delete(WcfIncidentResolutionService.IncidentResolution incidentResolution)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() =>
                client.DeleteIncidentResolutionAsync(new DeleteIncidentResolutionRequest { IncidentResolution = incidentResolution }),
                logger,
                "Delete IncidentResolution failed");
            return response;
        }

        public async Task<ExecuteIncidentResolutionResponse> Execute(string kbaId, string storedProcedureName, SPParameter[] spParameters)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() =>
                client.ExecuteIncidentResolutionAsync(new ExecuteIncidentResolutionRequest
                {
                    StoredProcedureName = storedProcedureName,
                    KBAId = kbaId,
                    Parameters = spParameters
                }),
                logger);
            return response;
        }

        public async Task<GetSPParametersResponse> GetStoredProcedureParameters(string storedProcedureName)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() =>
                client.GetSPParametersAsync(new GetSPParametersRequest { StoredProcedureName = storedProcedureName }),
                logger,
                "Could not retrieve stored procedure parameters"
            );
            return response;
        }
    }
}
