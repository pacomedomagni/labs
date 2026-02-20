using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Attributes;
using Progressive.Telematics.Labs.Shared.Configs;
using Progressive.Telematics.Labs.Shared.Utils;

namespace Progressive.Telematics.Labs.Services.Configuration;

[SingletonService]
public class ConfigSettings : ConfigSettingsBase
{
    private readonly IWCFAppConfigService _appConfigService;

    public ConfigSettings(
        IOptions<LabConfigSettings> labConfigSettings,
        IWCFAppConfigService appConfigService) 
        : base(labConfigSettings)
    {
        _appConfigService = appConfigService;
    }

    public override async Task<Dictionary<string, string>> GetServerConfigurationAsync(int? applicationCode = null, string serverName = null, string slotName = null)
    {
        var response = await _appConfigService.GetAppConfig(
            serverName ?? ServerName,
            applicationCode ?? ApplicationCode,
            slotName ?? SlotName);

        if (response?.AppConfigList?.ConfigList == null)
        {
            return new Dictionary<string, string>();
        }

        return response.AppConfigList.ConfigList
            .Where(c => !string.IsNullOrWhiteSpace(c.key))
            .ToDictionary(c => c.key, c => c.value ?? string.Empty);
    }

    public override async Task<Dictionary<string, string>> GetServerConfigurationByNameAsync(string applicationName = null, string serverName = null, string slotName = null)
    {
        var response = await _appConfigService.Get(
            serverName ?? ServerName,
            applicationName ?? ApplicationName,
            slotName ?? SlotName);

        if (response?.AppConfigList?.ConfigList == null)
        {
            return new Dictionary<string, string>();
        }

        return response.AppConfigList.ConfigList
            .Where(c => !string.IsNullOrWhiteSpace(c.key))
            .ToDictionary(c => c.key, c => c.value ?? string.Empty);
    }
}
