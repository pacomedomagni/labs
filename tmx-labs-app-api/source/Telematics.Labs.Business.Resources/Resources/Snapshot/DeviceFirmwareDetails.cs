using System.Text.Json.Serialization;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources;

[TsClass]
public class DeviceFirmwareDetails
{
    [JsonPropertyName("configurationFirmwareValue")]
    public string ConfigurationFirmwareValue { get; set; }

    [JsonPropertyName("targetConfigurationFirmwareValue")]
    public string TargetConfigurationFirmwareValue { get; set; }

    [JsonPropertyName("configurationFirmwareFileName")]
    public string ConfigurationFirmwareFileName { get; set; }

    [JsonPropertyName("targetConfigurationFirmwareFileName")]
    public string TargetConfigurationFirmwareFileName { get; set; }

    [JsonPropertyName("obd2FirmwareValue")]
    [TsProperty(Name = "obd2FirmwareValue")]
    public string OBD2FirmwareValue { get; set; }

    [JsonPropertyName("targetObd2FirmwareValue")]
    [TsProperty(Name = "targetObd2FirmwareValue")]
    public string TargetOBD2FirmwareValue { get; set; }

    [JsonPropertyName("obd2FirmwareFileName")]
    [TsProperty(Name = "obd2FirmwareFileName")]
    public string OBD2FirmwareFileName { get; set; }

    [JsonPropertyName("targetObd2FirmwareFileName")]
    [TsProperty(Name = "targetObd2FirmwareFileName")]
    public string TargetOBD2FirmwareFileName { get; set; }

    [JsonPropertyName("cellFirmwareValue")]
    public string CellFirmwareValue { get; set; }

    [JsonPropertyName("targetCellFirmwareValue")]
    public string TargetCellFirmwareValue { get; set; }

    [JsonPropertyName("cellFirmwareFileName")]
    public string CellFirmwareFileName { get; set; }

    [JsonPropertyName("TargetCellFirmwareFileName")]
    public string TargetCellFirmwareFileName { get; set; }

    [JsonPropertyName("gpsFirmwareValue")]
    [TsProperty(Name = "gpsFirmwareValue")]
    public string GPSFirmwareValue { get; set; }

    [JsonPropertyName("targetGpsFirmwareValue")]
    [TsProperty(Name = "targetGpsFirmwareValue")]
    public string TargetGPSFirmwareValue { get; set; }

    [JsonPropertyName("gpsFirmwareFileName")]
    [TsProperty(Name = "gpsFirmwareFileName")]
    public string GPSFirmwareFileName { get; set; }

    [JsonPropertyName("targetGpsFirmwareFileName")]
    [TsProperty(Name = "targetGpsFirmwareFileName")]
    public string TargetGPSFirmwareFileName { get; set; }

    [JsonPropertyName("mainFirmwareValue")]
    public string MainFirmwareValue { get; set; }

    [JsonPropertyName("targetMainFirmwareValue")]
    public string TargetMainFirmwareValue { get; set; }

    [JsonPropertyName("mainFirmwareFileName")]
    public string MainFirmwareFileName { get; set; }

    [JsonPropertyName("targetMainFirmwareFileName")]
    public string TargetMainFirmwareFileName { get; set; }
}

