using System.Linq;
using System.Threading.Tasks;
using Progressive.Telematics.Labs.Business.Resources.Resources.Configuration;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Configuration;

[SingletonService]
public interface IAppConfigurationOrchestrator
{
    Task<AppConfigurationModel> GetAppConfiguration(string serverName, int applicationCode, string slotName);
    Task<AppConfigurationModel> GetAppConfigurationByName(string serverName, string applicationName, string slotName);
}

public class AppConfigurationOrchestrator : IAppConfigurationOrchestrator
{
    private readonly IWCFAppConfigService _appConfigService;

    public AppConfigurationOrchestrator(IWCFAppConfigService appConfigService)
    {
        _appConfigService = appConfigService;
    }

    public async Task<AppConfigurationModel> GetAppConfiguration(string serverName, int applicationCode, string slotName)
    {
        var response = await _appConfigService.GetAppConfig(serverName, applicationCode, slotName);
        return MapToModel(response);
    }

    public async Task<AppConfigurationModel> GetAppConfigurationByName(string serverName, string applicationName, string slotName)
    {
        var response = await _appConfigService.Get(serverName, applicationName, slotName);
        return MapToModel(response);
    }

    private AppConfigurationModel MapToModel(WCFAppConfigService.AppConfigResponse response)
    {
        var model = new AppConfigurationModel();

        if (response?.AppConfigList?.ConfigList != null)
        {
            model.Configurations = response.AppConfigList.ConfigList
                .Where(c => !string.IsNullOrWhiteSpace(c.key))
                .ToDictionary(c => c.key, c => c.value ?? string.Empty);
        }

        return model;
    }
}
