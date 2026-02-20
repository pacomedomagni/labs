using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;
using Progressive.Telematics.Admin.Business.Resources.Enums;
using TypeLitePlus;

namespace Progressive.Telematics.Admin.Business.Resources;

[TsClass]
public class DeviceDetails : Resource
{
    [JsonPropertyName("deviceSeqID")]
    public Int32 DeviceSeqID { get; set; }

    [JsonPropertyName("deviceSerialNumber")]
    public String DeviceSerialNumber { get; set; }

    [JsonPropertyName("createDateTime")]
    public DateTime CreateDateTime { get; set; }

    [JsonPropertyName("SIM")]
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
    public Int32 VersionCode { get; set; }

    [JsonPropertyName("programCode")]
    public Int32? ProgramCode { get; set; }

    [JsonPropertyName("targetFirmwareSetCode")]
    public Int32 TargetFirmwareSetCode { get; set; }

    [JsonPropertyName("configurationFirmwareTypeVersionCode")]
    public Int32? ConfigurationFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("OBD2FirmwareTypeVersionCode")]
    public Int32? OBD2FirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("CellFirmwareTypeVersionCode")]
    public Int32? CellFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("GPSFirmwareTypeVersionCode")]
    public Int32 GPSFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("mainFirmwareTypeVersionCode")]
    public Int32? MainFirmwareTypeVersionCode { get; set; }

    [JsonPropertyName("reportedVIN")]
    public string ReportedVIN { get; set; }

    [JsonPropertyName("WTFStateInfo")]
    public string? WTFStateInfo { get; set; }

    [JsonPropertyName("manufacturerLotSeqID")]
    public Int32 ManufacturerLotSeqID { get; set; }

    [JsonPropertyName("returnLotSeqID")]
    public Int32? ReturnLotSeqID { get; set; }

    [JsonPropertyName("isDataCollectionAllowed")]
    public Boolean IsDataCollectionAllowed { get; set; }

    [JsonPropertyName("isSimActive")]
    public Boolean IsSimActive { get; set; }

    [JsonPropertyName("isDBImportAllowed")]
    public Boolean IsDBImportAllowed { get; set; }

    [JsonPropertyName("isCommunicationAllowed")]
    public Boolean IsCommunicationAllowed { get; set; }

    [JsonPropertyName("statusCode")]
    public Int32 StatusCode { get; set; }

    [JsonPropertyName("benchTestStatusCode")]
    public Int32? BenchTestStatusCode { get; set; }

    [JsonPropertyName("binaryTransferInfo")]
    public string? BinaryTransferInfo { get; set; }

    [JsonPropertyName("currentAudioVolume")]
    public Int32? CurrentAudioVolume { get; set; }

    [JsonPropertyName("targetAudioVolume")]
    public Int32 TargetAudioVolume { get; set; }

    [JsonPropertyName("locationCode")]
    public Int32 LocationCode { get; set; }

    [JsonPropertyName("reportedProtocolCode")]
    public Int32? ReportedProtocolCode { get; set; }

    [JsonPropertyName("lastRemoteResetDateTime")]
    public DateTime? LastRemoteResetDateTime { get; set; }

    [JsonPropertyName("IMEI")]
    public string? IMEI { get; set; }

    [JsonPropertyName("RMALotSeqID")]
    public Int32? RMALotSeqID { get; set; }

    [JsonPropertyName("inventoryLotSeqID")]
    public Int32? InventoryLotSeqID { get; set; }

    [JsonPropertyName("isRefurbished")]
    public Boolean? IsRefurbished { get; set; }

    [JsonPropertyName("lastChangeDateTime")]
    public DateTime? LastChangeDateTime { get; set; }

    [JsonPropertyName("GPSCollectionTypeCode")]
    public Int32? GPSCollectionTypeCode { get; set; }

    [JsonPropertyName("description")]
    public String? Description { get; set; }
}
