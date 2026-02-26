using System.Collections.Generic;

namespace Progressive.Telematics.Labs.Shared.Configs;

public class LabConfigSettings
{
    public ServersConfig Servers { get; set; }
}

public class ServersConfig
{
    public ServerInfo Test { get; set; }
    public Dictionary<string, string> ConfigKeys { get; set; }
}

public class ServerInfo
{
    public string Name { get; set; }
    public string Slot { get; set; }
    public int ApplicationCode { get; set; }
    public string ApplicationName { get; set; }
}
