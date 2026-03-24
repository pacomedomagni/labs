using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Labs.Business.Configuration;
using Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment.Services;
using Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;
using Progressive.Telematics.Labs.Services.Database;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace Progressive.Telematics.Labs.Business.Orchestrators.Fulfillment;

[SingletonService]

public interface IPrintLabelOrchestrator
{
    Task<bool> CrateLabelAndPrint(string printer, DeviceOrderInfo order);
    Task<(byte[] content, string fileName)> DownloadLabel(DeviceOrderInfo order);
}
public class PrintLabelOrchestrator : IPrintLabelOrchestrator
{
    private readonly IShippingLabelDataService _shippingLabelDataService;
    private readonly ILabelPrinterDAL _labelPrinterDAL;
    private readonly IDeviceOrderDAL _deviceOrderDAL;
    private readonly ILogger<PrintLabelOrchestrator> _logger;
    private readonly LabelPrintingOptions _options;

    public PrintLabelOrchestrator(
        IShippingLabelDataService shippingLabelDataService, 
        IConfiguration configuration, 
        ILabelPrinterDAL labelPrinterDAL,
        IDeviceOrderDAL deviceOrderDAL,
        ILogger<PrintLabelOrchestrator> logger,
        IOptions<LabelPrintingOptions> options)
    {
        _shippingLabelDataService = shippingLabelDataService;
        _labelPrinterDAL = labelPrinterDAL;
        _deviceOrderDAL = deviceOrderDAL;
        _logger = logger;
        _options = options?.Value;
    }

    public async Task<bool> CrateLabelAndPrint(string printer, DeviceOrderInfo order)
    {
        try
        {
            var printerConfig = await GetPrinterConfiguration(printer);
            var yValues = GetLabelYposValuesForPrinter(printerConfig);
            var zplLabel = await CreatePrintLabel(order, yValues, printerConfig);

            await SendToPrinterAsync(zplLabel, printerConfig);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to print label for order {OrderNumber} on printer {PrinterName}", order.OrderNumber, printer);
            throw;
        }
        //Update status to shipped
        await _deviceOrderDAL.UpdateDeviceOrder(
           order.DeviceOrderSeqID,
           deviceOrderStatusCode: DeviceOrderStatus.Shipped);
        return true;
    }

    public async Task<(byte[] content, string fileName)> DownloadLabel(DeviceOrderInfo order)
    {
        if (order == null)
            throw new ArgumentException("Order is required", nameof(order));
        try
        {
            var printerConfig = await GetPrinterConfiguration("ToFile-TEST");
            var yValues = GetLabelYposValuesForPrinter(printerConfig);
            string zpl = await CreatePrintLabel(order, yValues, printerConfig);

            var bytes = Encoding.UTF8.GetBytes(zpl);
            var fileName = $"Label-{order.OrderNumber}-{DateTimeOffset.Now.ToUnixTimeSeconds()}.txt";

            return (bytes, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate label download for order {OrderNumber}", order.OrderNumber);
            throw;
        }
    }

    private async Task<string> CreatePrintLabel(DeviceOrderInfo order, LabelYpositionValues yValues, LabelPrinter printer)
    {
        ShippingLabelInfo directPrintModel = await _shippingLabelDataService.GetShippingLabelData(order);
        ValidateLabelModel(directPrintModel);

        var zplLabelCode = new StringBuilder();
        CreateZplHeader(zplLabelCode);

        foreach (ShippingLabelInfo label in directPrintModel.Labels)
        {
            if (_options.IsUspsEnabled)
            {
                ValidateLabel(label);
                HandleUspsLabels(zplLabelCode, label, yValues, _options.IsUsingBlankLabels);
            }
            else
            {
                HandleNonUspsLabels(zplLabelCode, label, yValues, _options.IsUsingBlankLabels);
            }

            HandleDeviceLabels(zplLabelCode, label, yValues);
        }

        CreateZplTrailer(zplLabelCode);

        return zplLabelCode.ToString();
    }

    private async Task<LabelPrinter> GetPrinterConfiguration(string printerName)
    {
        var printer = await _labelPrinterDAL.GetLabelPrinterConfigurationByName(printerName);

        if (printer == null)
        {
            _logger.LogError("Printer configuration not found for {PrinterName}", printerName);
            throw new InvalidOperationException($"Printer '{printerName}' not found in configuration");
        }

        return printer;
    }

    private static void ValidateLabelModel(ShippingLabelInfo model)
    {
        // Check if tracking numbers indicate errors
        if ((!string.IsNullOrWhiteSpace(model.TrackingNumberReadable) && model.TrackingNumberReadable.Contains("Error")) ||
            (!string.IsNullOrWhiteSpace(model.ReturnTrackingNumberReadable) && model.ReturnTrackingNumberReadable.Contains("Error")))
        {
            string errorMessage = "Label generation failed. Cannot print label with invalid tracking numbers.";
            if (!string.IsNullOrWhiteSpace(model.TrackingNumberRaw))
            {
                errorMessage += $"\nMessage: {model.TrackingNumberRaw}";
            }
            throw new InvalidOperationException(errorMessage);
        }

        if (model.Labels == null || !model.Labels.Any())
        {
            throw new InvalidOperationException("No labels found to print.");
        }
    }

    private static void ValidateLabel(ShippingLabelInfo label)
    {
        var requiredFields = new Dictionary<string, string>
            {
                { nameof(label.DataMatrixRaw), label.DataMatrixRaw },
                { nameof(label.TrackingNumberRaw), label.TrackingNumberRaw },
                { nameof(label.TrackingNumberReadable), label.TrackingNumberReadable },
                { nameof(label.ReturnDataMatrixRaw), label.ReturnDataMatrixRaw },
                { nameof(label.ReturnTrackingNumberRaw), label.ReturnTrackingNumberRaw },
                { nameof(label.ReturnTrackingNumberReadable), label.ReturnTrackingNumberReadable }
            };

        foreach (KeyValuePair<string, string> field in requiredFields)
        {
            if (string.IsNullOrWhiteSpace(field.Value))
            {
                throw new ArgumentException($"{field.Key} cannot be null or whitespace. The label will be invalid.");
            }
        }

        if (label.TrackingNumberReadable == "Label Error" ||
        label.ReturnTrackingNumberReadable == "Label Error" ||
        string.IsNullOrWhiteSpace(label.TrackingNumberReadable) ||
        string.IsNullOrWhiteSpace(label.ReturnTrackingNumberReadable))
        {
            throw new InvalidOperationException("Label generation failed. Cannot print label with invalid tracking numbers.");
        }
    }

    private static void HandleUspsLabels(StringBuilder zplLabelCode, ShippingLabelInfo label, LabelYpositionValues yValues, bool isUsingBlankLabels)
    {
        if (!isUsingBlankLabels)
        {
            CreateLegacyReturnLabelWithUsps(zplLabelCode, label.ReturnTrackingNumberRaw, label.ReturnTrackingNumberReadable, yValues);
            CreateHorizontalUspsShippingLabel(
                zplLabelCode,
                label.CustomerName,
                label.Address1,
                label.Address2,
                label.City,
                label.State,
                label.Zip,
                label.ZipLet,
                label.DataMatrixRaw,
                label.TrackingNumberRaw,
                label.TrackingNumberReadable,
                yValues,
                label.NeedsHazmatLabel,
                label.PackageID
             );
        }
        else
        {
            CreateHorizontalUspsReturnLabel(zplLabelCode, label.ReturnTrackingNumberRaw, label.ReturnTrackingNumberReadable, label.ReturnDataMatrixRaw, yValues, label.NeedsHazmatLabel);
            CreateHorizontalUspsShippingLabel(
                zplLabelCode,
                label.CustomerName,
                label.Address1,
                label.Address2,
                label.City,
                label.State,
                label.Zip,
                label.ZipLet,
                label.DataMatrixRaw,
                label.TrackingNumberRaw,
                label.TrackingNumberReadable,
                yValues,
                label.NeedsHazmatLabel,
                label.PackageID
             );
        }
    }

    private static void HandleNonUspsLabels(StringBuilder zplLabelCode, ShippingLabelInfo label, LabelYpositionValues yValues, bool isUsingBlankLabels)
    {
        if (!isUsingBlankLabels)
        {
            CreateReturnLabel(zplLabelCode, label.ReturnTrackingNumberRaw, label.ReturnTrackingNumberReadable, yValues);
            CreateShippingLabel(
                zplLabelCode,
                label.CustomerName,
                label.Address1,
                label.Address2,
                label.City,
                label.State,
                label.Zip,
                label.ZipLet,
                label.DataMatrixRaw,
                label.TrackingNumberRaw,
                label.TrackingNumberReadable,
                label.PackageID,
                yValues
            );
        }
        else
        {
            CreateHorizontalUspsReturnLabel(zplLabelCode, label.ReturnTrackingNumberRaw, label.ReturnTrackingNumberReadable, null, yValues, false);
            CreateShippingLabel(
                zplLabelCode,
                label.CustomerName,
                label.Address1,
                label.Address2,
                label.City,
                label.State,
                label.Zip,
                label.ZipLet,
                label.DataMatrixRaw,
                label.TrackingNumberRaw,
                label.TrackingNumberReadable,
                label.PackageID,
                yValues
            );
        }

    }

    private static void HandleDeviceLabels(StringBuilder zplLabelCode, ShippingLabelInfo label, LabelYpositionValues yValues)
    {
        if (label.Vehicles.Count == 1)
        {
            string deviceLabel = !string.IsNullOrWhiteSpace(label.Vehicles[0].DeviceSerialNumber)
                ? label.Vehicles[0].DeviceSerialNumber
                : label.Vehicles[0].CableType;

            CreateDeviceLabels(
                zplLabelCode,
                label.Vehicles[0].Year.ToString(),
                label.Vehicles[0].Make,
                label.Vehicles[0].Model,
                string.Empty,
                string.Empty,
                string.Empty,
                deviceLabel,
                string.Empty,
                label.DeviceIdType,
                label.OrderID,
                yValues
            );
        }
        else
        {
            string deviceLabel1 = !string.IsNullOrWhiteSpace(label.Vehicles[0].DeviceSerialNumber)
                ? label.Vehicles[0].DeviceSerialNumber
                : label.Vehicles[0].CableType;

            string deviceLabel2 = !string.IsNullOrWhiteSpace(label.Vehicles[1].DeviceSerialNumber)
                ? label.Vehicles[1].DeviceSerialNumber
                : label.Vehicles[1].CableType;

            CreateDeviceLabels(
                zplLabelCode,
                label.Vehicles[0].Year.ToString(),
                label.Vehicles[0].Make,
                label.Vehicles[0].Model,
                label.Vehicles[1].Year.ToString() ?? "",
                label.Vehicles[1].Make ?? "",
                label.Vehicles[1].Model ?? "",
                deviceLabel1,
                deviceLabel2 ?? "",
                label.DeviceIdType,
                label.OrderID,
                yValues
            );
        }
    }

    private static void CreateZplHeader(StringBuilder zplLabelCode)
    {
        zplLabelCode.Append("$( ^FX ~JSB ^FX ~JSN ^FX ~JSB ");
    }

    private static void CreateZplTrailer(StringBuilder zplLabelCode)
    {
        zplLabelCode.Append(")$/n");
    }

    private static void CreateShippingLabel(StringBuilder zplLabelCode, string customerName, string address1, string address2, string city, string state, string zip, string ziplet, string dataMatrixRaw, string trackingNumberRaw, string trackingNumberReadable, string packageId, LabelYpositionValues yValues)
    {
        zplLabelCode.Append($@"^FX---- Shipping Label ----^FS ^FX-- Return Address --^FS ^A0B,20,20 ^FO50,{yValues.ReturnAddresseWithOffset}  ^FB200,100,5 ^FDProgressive\&P.O. Box 94573\&Cleveland, OH  44101^FS");
        zplLabelCode.Append($@"^FX-- Postage Box --^FS ^FO50,{yValues.PostageBoxBordersWithOffset} ^GB100,255,3 ^FS ^A0B,20,20 ^FO55,{yValues.PostageBoxTxtWithOffset} ^FB250,50,5,C ^FDPARCEL SELECT\&U.S.POSTAGE PAID\&UPS MAIL INNOVATIONS\&eVS^FS");
        zplLabelCode.Append($@"^FX-- Forward Service Msg-- ^FS ^A0B, 40, 40 ^FO130, {yValues.ForwardServiceMessageWithOffset} ^FB1050,40,0,C ^FDForward Service Requested ^FS");
        zplLabelCode.Append($@"^FX-- Shipping Address --^FS ^A0B,30,30 ^FO180,{yValues.ShippingAndToTxtWithOffset} ^FB100,100,5,L ^FDSHIP\&TO:^FS");
        zplLabelCode.Append($@"^A0B,25,25 ^FO180,{yValues.ShippingAddressBlockWithOffset} ^FB480,200,5,L ^FH ^FD");
        zplLabelCode.Append($"{customerName} ");
        zplLabelCode.Append(@"\&");
        zplLabelCode.Append($"{address1} ");
        zplLabelCode.Append(@"\&");
        zplLabelCode.Append($"{address2} ");
        zplLabelCode.Append(@"\&");
        zplLabelCode.Append($"{city}, ");
        zplLabelCode.Append($"{state} ");
        zplLabelCode.Append($"{zip}");
        if (string.IsNullOrEmpty(ziplet) != true)
        {
            zplLabelCode.Append($"-{ziplet}");
        }
        zplLabelCode.Append(@"^FS(customer name mailing address)");
        zplLabelCode.Append($@"^FX-- UPS Data Matrix-- ^FS ^FO180,{yValues.UpsDataMatrixTopBottomBordersWithOffset} ^GB0,480,6 ^FS ^FO180,{yValues.UpsDataMatrixMiddleLineWithOffset}  ^GB180,0,6 ^FS ^FO360,{yValues.UpsDataMatrixTopBottomBordersWithOffset} ^GB0,480,6 ^FS ^FO200,{yValues.UpsDataMatrixItselfWithOffset} ^BXB,3,200,,,,_,1 ^FH_ ^FD");
        zplLabelCode.Append($"{dataMatrixRaw}^FS(data matrix data string)");
        zplLabelCode.Append($@"^A0B,25,25 ^FO190,{yValues.UpsDataMatrixDataStrLeftStartingPosWithOffset} ^FB300,30,5,L ^FDUPS MAIL INNOVATIONS^FS ^A0B,20,20 ^FO230,{yValues.UpsDataMatrixDataStrLeftStartingPosWithOffset} ^FB300,30,5,L ^FDPOSTAL CODE: ^FS");
        zplLabelCode.Append($"^A0B,20,20 ^FO230,{yValues.UpsDataMatrixDataStrLeftStartingPosWithOffset} ^FB175,30,5,L ^FD {zip} ^FS(Postal Code) ^A0B,20,20 ^FO255,{yValues.UpsDataMatrixDataStrLeftStartingPosWithOffset} ^FB300,30,5,L ^FDPACKAGE ID#: ^FS");
        zplLabelCode.Append($"^A0B,20,20 ^FO255,{yValues.UpsDataMatrixDataStrLeftStartingPosWithOffset} ^FB175,30,5,L ^FD {packageId} ^FS(Package ID) ");
        zplLabelCode.Append($@"^FX-- USPS IMpb Barcode-- ^FS ^MD0 ^FO400,{yValues.UpsImpbBarcodeTopBottomBordersWithOffset} ^GB0,1080,10 ^FS ^A0B,30,30 ^FO431,{yValues.UpsBarcodeTitleWithOffset} ^FB1080,30,0,C ^FDUSPS TRACKING # eVS^FS");
        zplLabelCode.Append($"^FO486,{yValues.UpsTrackingBarcodeWithOffset} ^BY3,2.0,141 ^BCB,150,N,N,N,D ^FD{trackingNumberRaw}^FS(USPS barcode data) ^A0B,30,30 ^FO666,{yValues.UpsTrackingBarcodeReadableTxtWithOffset} ^FB1080,30,0,C ^FD{trackingNumberReadable}^FS(visible barcode data) ^FO713,{yValues.UpsImpbBarcodeTopBottomBordersWithOffset} ^GB0,1080,10 ^FS");
    }

    private static void CreateReturnLabel(StringBuilder zplLabelCode, string returnTrackingNumberRaw, string returnTrackingNumberReadable, LabelYpositionValues yValues)
    {
        zplLabelCode.Append($"^XA ^MNM ^POI ^MD30 ^PW734 ^FX---- Return Label---- ^FS ^FX-- USPS IMpb Barcode-- ^FS ^MNM ^MD0 ^FO486, {yValues.UspsImpbBarcodeWithOffset} ^BY3, 2.0, 145 ^BCB,150,N,N,N,D");
        zplLabelCode.Append($" ^FD{returnTrackingNumberRaw}^FS(USPS barcode data) ^A0B,30,30 ^FO666,{yValues.UspsReadableBarcodeWithOffset} ^FB800,30,0,C ^FD{returnTrackingNumberReadable}^FS(visible barcode data)");
    }

    private static void CreateLegacyReturnLabelWithUsps(StringBuilder zplLabelCode, string returnTrackingNumberRaw, string returnTrackingNumberReadable, LabelYpositionValues yValues)
    {
        zplLabelCode.Append($"^XA ^MNM ^POI ^MD30 ^PW734 ^FX---- Return Label---- ^FS ^FX-- USPS IMpb Barcode-- ^FS ^MNM ^MD0 ^BY3,2,145 ^BCB,150,N,N,N,D ^FO476,{yValues.UspsImpbBarcodeWithOffset}");
        zplLabelCode.Append($" ^FD{returnTrackingNumberRaw}^FS(USPS barcode data) ^A0B,30,30 ^FO666,{yValues.UspsReadableBarcodeWithOffset} ^FB800,30,0,C ^FD{returnTrackingNumberReadable}^FS(visible barcode data)");
    }

    private static void CreateHorizontalUspsReturnLabel(StringBuilder zplLabelCode, string returnTrackingNumberRaw, string returnTrackingNumberReadable, string returnDataMatrixRaw, LabelYpositionValues yValues, bool needsHazmatLabel)
    {
        string shippingTypeCode = needsHazmatLabel ? "H" : "G";
        string labelHeader = needsHazmatLabel ? "USPS TRACKING # HAZMAT USPS SHIP" : "USPS TRACKING # USPS SHIP";

        zplLabelCode.Append($@"^XA ^MNM ^POI ^MD30 ^PW734");
        zplLabelCode.Append($@"^FX ---- Return Label ---- ^FS FO0,{yValues.HorizontalUspsReturnLabelOffset} ^GB0,883,5^FS");
        zplLabelCode.Append($@"^FX -- Shipping Type -- ^FS ^FO0,{yValues.HorizontalReturnShippingTypeCodeBorderWithOffset} ^GB155,4,4^FS");
        zplLabelCode.Append($@"^FO35,{yValues.HorizontalReturnShippingTypeCodeLetterWithOffset} ^A0B,130,130 ^FD{shippingTypeCode}^FS");

        zplLabelCode.Append($@"^FO155,{yValues.HorizontalUspsReturnLabelOffset} ^GB0,883,5^FS");

        zplLabelCode.Append($@"^FX -- Postage Box -- ^FS ^FO23,{yValues.HorizontalReturnPostageBoxBorderWithOffset} ^GB125,170,2^FS ^A0B,20,20");
        zplLabelCode.Append($@"^FO43,{yValues.HorizontalReturnPostageBoxTextWithOffset} ^FB145,40,3 ^FDNO POSTAGE NECESSARY IF MAILED IN THE UNITED STATES^FS");

        zplLabelCode.Append($@"^FX -- Package Type Banner -- ^FS ^A0B,40,40
            ^FO170,{yValues.HorizontalReturnPackageTypeBannerWithOffset} ^FB1100,40,0,C ^FDUSPS GROUND ADVANTAGE^FS
            ^FO170,{yValues.HorizontalReturnPackageTypeTMTextWithOffset} ^A0B,20,20 ^FDTM^FS
            ^FO170,{yValues.HorizontalReturnPackageTypeReturnTextWithOffset} ^A0B,40,40 ^FD RETURN^FS");

        zplLabelCode.Append($@"^FO210,{yValues.HorizontalUspsReturnLabelOffset} ^GB0,883,5^FS");

        // Add ^FH before ^FD for return address with hex interpretation
        zplLabelCode.Append($@"^FX -- Return Address -- ^FS ^FO225,{yValues.HorizontalReturnAddressWithOffset} ^A0B,20,20 ^FB200,100,3 ^FH ^FDPROGRESSIVE\&P.O. BOX 94573\&CLEVELAND, OH 44101^FS");

        if (needsHazmatLabel)
        {
            zplLabelCode.Append($@"^FX Hazmat Verbiage -- ^FS ^FO225,{yValues.HorizontalReturnHazmatVerbiageWithOffset} ^A0B,20,20 ^FB400,200,3 ^FDHAZMAT - SURFACE TRANSPORTATION ONLY^FS");
        }

        zplLabelCode.Append($@"^FX -- USPS 2D Barcode -- ^FS ^FO325,{yValues.HorizontalReturnUspsDataMatrixBarcodeWithOffset} ^BXB,4,200,20,20,6,_ ^FD_{returnDataMatrixRaw}^FS");

        zplLabelCode.Append($@"^FO430,{yValues.HorizontalUspsReturnLabelOffset} ^GB0,883,8^FS");

        // Add ^FH before ^FD for shipping address with hex interpretation
        zplLabelCode.Append($@"^FX -- Shipping Address -- ^FS ^FO325,{yValues.HorizontalReturnShippingAddressWithOffset} ^A0B,26,26 ^FB400,200,3,L ^FH ^FDPROGRESSIVE\&P.O. BOX 94573\&CLEVELAND, OH 44101^FS");
        zplLabelCode.Append($@"^FX -- Label Header -- ^FS ^FO457,{yValues.HorizontalReturnLabelHeaderWithOffset} ^A0B,30,30 ^FB640,30,0,C ^FD{labelHeader}^FS");
        zplLabelCode.Append($@"^FX-- USPS IMpb Barcode -- ^FS ^FO505,{yValues.HorizontalReturnUspsImbpBarcodeWithOffset} ^BY3,2,145 ^BCB,150,N,N,N,D ^FD{returnTrackingNumberRaw}^FS");
        zplLabelCode.Append($@"^FX Human-readable barcode -- ^FS ^A0B,30,30 ^FO681,{yValues.HorizontalReturnHumanReadableBarcodeWithOffset} ^FB800,30,0,C ^FD{returnTrackingNumberReadable}^FS");

        zplLabelCode.Append($@"^FO723,{yValues.HorizontalUspsReturnLabelOffset} ^GB0,883,8^FS");
    }

    private static void CreateHorizontalUspsShippingLabel(StringBuilder zplLabelCode, string customerName, string address1, string address2, string city, string state, string zip, string ziplet, string dataMatrixRaw, string trackingNumberRaw, string trackingNumberReadable, LabelYpositionValues yValues, bool needsHazmatLabel, string packageId)
    {
        string shippingTypeCode = needsHazmatLabel ? "H" : "G";
        string labelHeader = needsHazmatLabel ? "USPS TRACKING # HAZMAT USPS SHIP" : "USPS TRACKING # USPS SHIP";

        zplLabelCode.Append($@"^FX ---- Shipping Label ---- ^FS ^FO0,{yValues.HorizontalUspsShippingLabelOffset} ^GB0,1080,5^FS");
        zplLabelCode.Append($@"^FX -- Shipping Type -- ^FS ^FO0,{yValues.HorizontalShippingTypeCodeBorderWithOffset} ^GB160,4,4^FS");
        zplLabelCode.Append($@"^FO35,{yValues.HorizontalShippingTypeCodeLetterWithOffset} ^A0B,130,130 ^FD{shippingTypeCode}^FS");

        zplLabelCode.Append($@"^FO155,{yValues.HorizontalUspsShippingLabelOffset} ^GB0,1080,5^FS");

        zplLabelCode.Append($@" ^FX -- Postage Box -- ^FS ^FO23,{yValues.HorizontalShippingPostageBoxBorderWithOffset} ^GB125,188,2^FS ^A0B,20,20");
        zplLabelCode.Append($@"^FO43,{yValues.HorizontalShippingPostageBoxTextWithOffset} ^FB235,40,3,C ^FDPERMIT NO. 5199\&WASHINGTON DC\&USPS SHIP\&GROUND ADVANTAGE^FS");
        zplLabelCode.Append($@"^FX -- Package Type Banner -- ^FS ^A0B,40,40
            ^FO170,{yValues.HorizontalShippingPackageTypeBannerWithOffset} ^FB1050,40,0,C ^FDUSPS GROUND ADVANTAGE^FS
            ^FO170,{yValues.HorizontalShippingPackageTypeTMTextWithOffset} ^A0B,20,20^FDTM^FS");

        zplLabelCode.Append($@"^FO210,{yValues.HorizontalUspsShippingLabelOffset} ^GB0,1080,5^FS");

        zplLabelCode.Append($@"^FX -- Return Address -- ^FS ^A0B,20,20 ^FO225,{yValues.HorizontalShippingReturnAddressWithOffset} ^FB200,100,3 ^FDPROGRESSIVE\&P.O. BOX 94573\&CLEVELAND, OH 44101^FS");

        if (needsHazmatLabel)
        {
            zplLabelCode.Append($@"^FX Hazmat Verbiage -- ^FS ^FO225,{yValues.HorizontalShippingHazmatVerbiageWithOffset} ^A0B,20,20 ^FB400,200,3 ^FDHAZMAT - SURFACE TRANSPORTATION ONLY^FS");
        }

        zplLabelCode.Append($@"^FX -- USPS IMBP -- ^FS ^FO320,{yValues.HorizontalShippingUspsDataMatrixBarcodeWithOffset} ^BXB,4,200,20,20,6,_ ^FD_{dataMatrixRaw}^FS");

        // Add ^FH before ^FD to enable hex interpretation for the shipping address
        zplLabelCode.Append($@"^FX -- Shipping Address -- ^FS ^A0B,23,23 ^FO300,{yValues.HorizontalShippingShippingAddressWithOffset} ^FB600,400,4,L ^FH ^FD{customerName}\&{address1}\&{address2}\&{city}, {state} {zip}");
        if (!string.IsNullOrEmpty(ziplet))
        {
            zplLabelCode.Append($"-{ziplet}");
        }
        zplLabelCode.Append($@"^FS");

        // Add Package ID section similar to UPS MI label
        if (!string.IsNullOrEmpty(packageId))
        {
            zplLabelCode.Append($@"^FX -- Package ID -- ^FS ^A0B,20,20 ^FO305,{yValues.HorizontalShippingPackageIdTextWithOffset} ^FB300,30,5,L ^FDPACKAGE ID#: ^FS");
            zplLabelCode.Append($@"^A0B,20,20 ^FO305,{yValues.HorizontalShippingPackageIdTextWithOffset} ^FB175,30,5,L ^FD {packageId} ^FS");
        }

        zplLabelCode.Append($@"^FO430,{yValues.HorizontalUspsShippingLabelOffset} ^GB0,1080,8^FS");

        zplLabelCode.Append($@"^FX Label Header -- ^FS ^A0B,30,30 ^FO455,{yValues.HorizontalShippingLabelHeaderWithOffset} ^FB1080,30,0,C ^FD{labelHeader}^FS");
        zplLabelCode.Append($@"^FX 1D Barcode -- ^FS ^FO505,{yValues.HorizontalShippingUsps1DBarcodeWithOffset} ^BY3,2,141 ^BCB,150,N,N,N,D ^FD{trackingNumberRaw}^FS");
        zplLabelCode.Append($@"^FX Human-readable barcode -- ^FS ^FO681,{yValues.HorizontalShippingHumanReadableBarcodeWithOffset} ^A0B,30,30 ^FB1080,30,0,C ^FD{trackingNumberReadable}^FS");
        zplLabelCode.Append($@"^FO723,{yValues.HorizontalUspsShippingLabelOffset} ^GB0,1080,8^FS");
    }

    private static void CreateDeviceLabels(StringBuilder zplLabelCode, string vehicle1Year, string vehicle1Make, string vehicle1Model, string vehicle2Year, string vehicle2Make, string vehicle2Model, string dsn1, string dsn2, string deviceIdType, string orderId, LabelYpositionValues yValues)
    {
        zplLabelCode.Append($@"^FX---- Device Labels ----^FS ^FX-- Device label 1-- ^FS ^A@B,35,20,E:HUM000.FNT ^FO50,{yValues.DeviceLabelRightWithOffset} ^FB300,30,0, L ^FWN,0 ^FDThis device is assigned to:^FS");
        zplLabelCode.Append($"^A@B,40,25,E:HUM000.FNT ^FO50,{yValues.DeviceLabelYearMakeModelWithOffset} ^FB300,150,0,L ^FWN,0 ^FD {vehicle1Year} {vehicle1Make} {vehicle1Model} ^FS(Vehicle YMM #1) ^A@B,30,20,E:HUM000.FNT ^FO50,{yValues.DeviceLabelPlugInDeviceTxtWithOffset} ^FB300,30,0, L ^FWN,0 ^FDPlug in your device now.^FS");
        zplLabelCode.Append($"^A@B,40,20,E:HUM000.FNT ^FO50,{yValues.DeviceLabelDeviceSerialNumberWithOffset} ^FB300,40,0, L ^FWN,0 ^FD {deviceIdType} ID:^FS ^A@B,40,15,E:HUM000.FNT ^FO215,{yValues.DeviceLabelDeviceSerialNumberWithOffset} ^FB180,40,0, L ^FWN,0 ^FD {dsn1} ^FS(Device Serial Number #1)");
        zplLabelCode.Append($"^A@B,40,20,E:HUM000.FNT ^FO50,{yValues.DeviceLabelOrderNumberWithOffset} ^FB300,30,0, L ^FWN,0 ^FDOrder #:^FS ^A@B,40,15,E:HUM000.FNT ^FO215,{yValues.DeviceLabelOrderNumberWithOffset} ^FB180,40,0, L ^FWN,0 ^FD {orderId} ^FS(Order Number #1)");

        zplLabelCode.Append($@"^FX-- Device label 2-- ^FS ^A@B,35,20,E:HUM000.FNT ^FO410,{yValues.DeviceLabelRightWithOffset} ^FB300,30,0, L ^FWN,0 ^FDThis device is assigned to:^FS");
        zplLabelCode.Append($"^A@B,45,25,E:HUM000.FNT ^FO410,{yValues.DeviceLabelYearMakeModelWithOffset} ^FB300,150,0, L ^FWN,0 ^FD {vehicle2Year} {vehicle2Make} {vehicle2Model} ^FS(Vehicle YMM #2) ^A@B,30,20,E:HUM000.FNT ^FO410,{yValues.DeviceLabelPlugInDeviceTxtWithOffset} ^FB300,30,0, L ^FWN,0 ^FDPlug in your device now.^FS");
        zplLabelCode.Append($"^A@B,40,20,E:HUM000.FNT ^FO410,{yValues.DeviceLabelDeviceSerialNumberWithOffset} ^FB300,40,0, L ^FWN,0 ^FD {deviceIdType} ID:^FS ^A@B,40,15,E:HUM000.FNT ^FO565,{yValues.DeviceLabelDeviceSerialNumberWithOffset} ^FB180,40,0, L ^FWN,0 ^FD {dsn2} ^FS(Device Serial Number #2)");
        zplLabelCode.Append($"^A@B,40,20,E:HUM000.FNT ^FO410,{yValues.DeviceLabelOrderNumberWithOffset} ^FB300,40,0, L ^FWN,0 ^FDOrder #:^FS ^A@B,40,15,E:HUM000.FNT ^FO565,{yValues.DeviceLabelOrderNumberWithOffset} ^FB180,40,0, L ^FWN,0 ^FD {orderId} ^FS(Order Number #2) ^XZ");
    }

    private void SendLabelToFile(string zpl)
    {
        string fileName = $"TestPrintZPL-{DateTimeOffset.Now.ToUnixTimeSeconds()}.txt";

        _logger.LogInformation("Writing label to file {FileName}", fileName);

        File.WriteAllText(fileName, zpl);
    }

    private async Task SendToPrinterAsync(string zpl, LabelPrinter printerConfig)
    {
        if (printerConfig.PrinterName == "ToFile-TEST")
        {
            SendLabelToFile(zpl);
            return;
        }

        try
        {
            _logger.LogDebug("Connecting to printer {IPAddress}:{Port}", 
                printerConfig.IPAddress, _options.PrinterPort);

            using var client = new TcpClient();
            await client.ConnectAsync(printerConfig.IPAddress, _options.PrinterPort);

            await using var stream = client.GetStream();
            await using var writer = new StreamWriter(stream);
            await writer.WriteAsync(zpl);
            await writer.FlushAsync();

            _logger.LogInformation("Successfully sent label to printer {PrinterName} at {IPAddress}", 
                printerConfig.PrinterName, printerConfig.IPAddress);
        }
        catch (SocketException ex)
        {
            _logger.LogError(ex, "Failed to connect to printer {PrinterName} at {IPAddress}:{Port}",
                printerConfig.PrinterName, printerConfig.IPAddress, _options.PrinterPort);
            throw new InvalidOperationException(
                $"Failed to connect to printer '{printerConfig.PrinterName}' at {printerConfig.IPAddress}:{_options.PrinterPort}. Please verify the printer is online.",
                ex);
        }
    }

    private static LabelYpositionValues GetLabelYposValuesForPrinter(LabelPrinter printerConfig)
    {
        if (printerConfig == null || string.IsNullOrWhiteSpace(printerConfig.YPosOffset))
        {
            return new LabelYpositionValues();
        }

        try
        {
            using var jsonDoc = JsonDocument.Parse(printerConfig.YPosOffset);
            var root = jsonDoc.RootElement;

            if (!root.TryGetProperty(printerConfig.IPAddress, out var yPosOffsetsElement) ||
                yPosOffsetsElement.ValueKind != JsonValueKind.Array)
            {
                return new LabelYpositionValues();
            }

            const int expectedOffsetCount = 5;
            if (yPosOffsetsElement.GetArrayLength() != expectedOffsetCount)
            {
                return new LabelYpositionValues();
            }

            return new LabelYpositionValues(
                yPosOffsetsElement[0].GetInt32(),
                yPosOffsetsElement[1].GetInt32(),
                yPosOffsetsElement[2].GetInt32(),
                yPosOffsetsElement[3].GetInt32(),
                yPosOffsetsElement[4].GetInt32());
        }
        catch (JsonException)
        {
            return new LabelYpositionValues();
        }
    }
}
