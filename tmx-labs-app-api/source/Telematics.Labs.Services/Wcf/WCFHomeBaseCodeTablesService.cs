using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFHomeBaseCodeTablesService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFHomeBaseCodeTablesService
    {
        Task<GetDevicePrepCodeTablesResponse1> GetDevicePrepCodeTables();
        Task<GetFulfillmentCodeTablesResponse1> GetFulfillmentCodeTables();
        Task<GetCodeTablesResponse1> GetCodeTables();
    }

    public class WCFHomeBaseCodeTablesService : WcfService<CodeTablesServiceClient>, IWCFHomeBaseCodeTablesService
    {
        public WCFHomeBaseCodeTablesService(
            ILogger<WCFHomeBaseCodeTablesService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFHomeBaseCodeTablesServiceClient) { }

        public async Task<GetDevicePrepCodeTablesResponse1> GetDevicePrepCodeTables()
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetDevicePrepCodeTablesAsync(), 
                logger, "Unable to get device prep code tables from HomeBaseServices");
            return response;
        }

        public async Task<GetFulfillmentCodeTablesResponse1> GetFulfillmentCodeTables()
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetFulfillmentCodeTablesAsync(), 
                logger, "Unable to get fulfillment code tables from HomeBaseServices");
            return response;
        }

        public async Task<GetCodeTablesResponse1> GetCodeTables()
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetCodeTablesAsync(), 
                logger, "Unable to get code tables from HomeBaseServices");
            return response;
        }
    }
}
