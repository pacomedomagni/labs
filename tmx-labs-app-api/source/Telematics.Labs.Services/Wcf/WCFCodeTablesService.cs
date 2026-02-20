using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFCodeTablesService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFCodeTablesService
    {
        Task<GetCodeTablesResponse1> GetCodeTables(GetCodeTablesRequest request);
    }

    public class WCFCodeTablesService : WcfService<CodeTablesServiceClient>, IWCFCodeTablesService
    {
        public WCFCodeTablesService(
            ILogger<WCFCodeTablesService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFCodeTablesServiceClient) { }

        public async Task<GetCodeTablesResponse1> GetCodeTables(GetCodeTablesRequest request)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetCodeTablesAsync(), 
                logger, "Unable to get code tables from MyScoreBusiness");
            return response;
        }
    }
}
