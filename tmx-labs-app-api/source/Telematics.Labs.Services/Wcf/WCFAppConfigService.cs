using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WCFAppConfigService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IWCFAppConfigService
    {
        Task<AppConfigResponse> GetAppConfig(string serverName, int applicationCode, string slotName);
        Task<AppConfigResponse> Get(string serverName, string applicationName, string slotName);
    }

    public class WCFAppConfigService : WcfService<AppConfigServiceClient>, IWCFAppConfigService
    {
        public WCFAppConfigService(
            ILogger<WCFAppConfigService> logger, 
            IWcfServiceFactory factory)
            : base(logger, factory.CreateWCFAppConfigServiceClient) { }

        public async Task<AppConfigResponse> GetAppConfig(string serverName, int applicationCode, string slotName)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetAppConfigAsync(serverName, applicationCode, slotName), 
                logger, "Unable to get app config");
            return response;
        }

        public async Task<AppConfigResponse> Get(string serverName, string applicationName, string slotName)
        {
            await using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetAsync(serverName, applicationName, slotName), 
                logger, "Unable to get app config by name");
            return response;
        }
    }
}
