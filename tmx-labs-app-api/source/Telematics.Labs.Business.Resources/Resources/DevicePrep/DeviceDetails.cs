using System;
using System.Text.Json.Serialization;
using Progressive.Telematics.Labs.Business.Resources.Shared;
using TypeLitePlus;

namespace Progressive.Telematics.Labs.Business.Resources.DevicePrep;

[TsClass]
public class DeviceDetails : Resource
{
    [JsonPropertyName("deviceSeqID")]
    public int DeviceSeqID { get; set; }

    [JsonPropertyName("deviceSerialNumber")]
    public string DeviceSerialNumber { get; set; }

    [JsonPropertyName("createDateTime")]
    public DateTime CreateDateTime { get; set; }

    [JsonPropertyName("sim")]
    public string SIM { get; set; }

    [JsonPropertyName("shipDateTime")]
    public DateTime? ShipDateTime { get; set; }

    [JsonPropertyName("firstContactDateTime")]
    public DateTime? FirstContactDateTime { get; set; }

    [JsonPropertyName("lastContactDateTime")]
    public DateTime? LastContactDateTime { get; set; }

    [JsonPropertyName("lastUploadDateTime")]
    public DateTime? LastUploadDateTime { get; set; }

    [JsonPropertyName("versionCode")]
    public int VersionCode { get; set; }

    [JsonPropertyName("programCode")]
    public int? ProgramCode { get; set; }

    [JsonPropertyName("targetFirmwareSetCode")]
    public int TargetFirmwareSetCode { get; set; }

    [JsonPropertyName("configurationFirmwareTypeVersionCode")]
    public int? ConfigurationFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("OBD2FirmwareTypeVersionCode")]
    public int? OBD2FirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("CellFirmwareTypeVersionCode")]
    public int? CellFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("GPSFirmwareTypeVersionCode")]
    public int GPSFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("mainFirmwareTypeVersionCode")]
    public int? MainFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("reportedVIN")]
    public string ReportedVIN { get; set; }

    [JsonPropertyName("WTFStateInfo")]
    public string WTFStateInfo { get; set; }

    [JsonPropertyName("manufacturerLotSeqID")]
    public int ManufacturerLotSeqID { get; set; }

    [JsonPropertyName("returnLotSeqID")]
    public int? ReturnLotSeqID { get; set; }

    [JsonPropertyName("isDataCollectionAllowed")]
    public bool IsDataCollectionAllowed { get; set; }

    [JsonPropertyName("isSimActive")]
    public bool IsSimActive { get; set; }

    [JsonPropertyName("isDBImportAllowed")]
    public bool IsDBImportAllowed { get; set; }

    [JsonPropertyName("isCommunicationAllowed")]
    public bool IsCommunicationAllowed { get; set; }

    [JsonPropertyName("statusCode")]
    public int StatusCode { get; set; }

    [JsonPropertyName("benchTestStatusCode")]
    public int? BenchTestStatusCode { get; set; }

    [JsonPropertyName("binaryTransferInfo")]
    public string BinaryTransferInfo { get; set; }

    [JsonPropertyName("currentAudioVolume")]
    public int? CurrentAudioVolume { get; set; }

    [JsonPropertyName("targetAudioVolume")]
    public int TargetAudioVolume { get; set; }

    [JsonPropertyName("locationCode")]
    public int LocationCode { get; set; }

    [JsonPropertyName("reportedProtocolCode")]
    public int? ReportedProtocolCode { get; set; }

    [JsonPropertyName("lastRemoteResetDateTime")]
    public DateTime? LastRemoteResetDateTime { get; set; }

    [JsonPropertyName("IMEI")]
    public string IMEI { get; set; }

    [JsonPropertyName("RMALotSeqID")]
    public int? RMALotSeqID { get; set; }

    [JsonPropertyName("inventoryLotSeqID")]
    public int? InventoryLotSeqID { get; set; }

    [JsonPropertyName("isRefurbished")]
    public bool? IsRefurbished { get; set; }

    [JsonPropertyName("lastChangeDateTime")]
    public DateTime? LastChangeDateTime { get; set; }

    [JsonPropertyName("GPSCollectionTypeCode")]
    public int? GPSCollectionTypeCode { get; set; }

    [JsonPropertyName("description")]
    public string Description { get; set; }
}

