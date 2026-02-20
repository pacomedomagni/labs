using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Shared.Configs;

namespace Progressive.Telematics.Labs.Shared.Utils;

public interface IConfigSettings
{
    Task<Dictionary<string, string>> GetServerConfigurationAsync(int? applicationCode = null, string serverName = null, string slotName = null);
    Task<Dictionary<string, string>> GetServerConfigurationByNameAsync(string applicationName = null, string serverName = null, string slotName = null);
    Task<string> GetConfigValueAsync(string key, int? applicationCode = null, string serverName = null, string slotName = null);
    string GetConfigKeyMapping(string key);
    string ServerName { get; }
    string SlotName { get; }
    int ApplicationCode { get; }
    string ApplicationName { get; }
}

public abstract class ConfigSettingsBase : IConfigSettings
{
    protected readonly LabConfigSettings _labConfigSettings;

    protected ConfigSettingsBase(IOptions<LabConfigSettings> labConfigSettings)
    {
        _labConfigSettings = labConfigSettings.Value;
    }

    public string ServerName => _labConfigSettings?.Servers?.Test?.Name;
    public string SlotName => _labConfigSettings?.Servers?.Test?.Slot;
    public int ApplicationCode => _labConfigSettings?.Servers?.Test?.ApplicationCode ?? 0;
    public string ApplicationName => _labConfigSettings?.Servers?.Test?.ApplicationName;

    public string GetConfigKeyMapping(string key)
    {
        if (_labConfigSettings?.Servers?.ConfigKeys != null &&
            _labConfigSettings.Servers.ConfigKeys.TryGetValue(key, out var value))
        {
            return value;
        }
        return null;
    }

    public abstract Task<Dictionary<string, string>> GetServerConfigurationAsync(int? applicationCode = null, string serverName = null, string slotName = null);
    public abstract Task<Dictionary<string, string>> GetServerConfigurationByNameAsync(string applicationName = null, string serverName = null, string slotName = null);

    public async Task<string> GetConfigValueAsync(string key, int? applicationCode = null, string serverName = null, string slotName = null)
    {
        var config = await GetServerConfigurationAsync(applicationCode, serverName, slotName);
        return config.TryGetValue(key, out var value) ? value : null;
    }
}
