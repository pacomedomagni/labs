using System;

namespace Progressive.Telematics.Labs.Business.Resources;
public class ApplicationConfig
{
    public int ApplicationCode { get; set; }
    public int ServerCode { get; set; }
    public int SlotCode { get; set; }
    public int ConfigSectionCode { get; set; }
    public string ConfigKey { get; set; }
    public string ConfigValue { get; set; }
    public int? ReplacementConfigSectionCode { get; set; }
    public DateTime CreateDateTime { get; set; }
    public DateTime LastChangeDateTime { get; set; }
    public string LastChangeUserId { get; set; }
}

