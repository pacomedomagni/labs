using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Business.Resources.Resources.Configuration;

public class AppConfigurationModel : Resource
{
    public AppConfigurationModel()
    {
        Configurations = new Dictionary<string, string>();
    }

    public Dictionary<string, string> Configurations { get; set; }
}

public class AppConfigItem
{
    public string Key { get; set; }
    public string Value { get; set; }
    public string SectionName { get; set; }
    public string ReplacementSectionName { get; set; }
}
