using System;

namespace Progressive.Telematics.Labs.Business.Resources.Domain.Fulfillment;

public class LabelYpositionValues
{
    private const int DefaultReturnLabelOffset = 14;
    private const int DefaultHorizontalUspsReturnLabelOffset = 10;

    private const int DefaultShippingLabelOffset = 944;
    private const int DefaultHorizontalUspsShippingLabelOffset = 944;

    private const int DefaultDeviceLabelOffset = 2125;


    // Return Labels Defaults
    public int ReturnLabelOffset { get; } =  DefaultReturnLabelOffset;
    public int HorizontalUspsReturnLabelOffset { get; } = DefaultHorizontalUspsReturnLabelOffset;


    // Shipping Labels Defaults
    public int ShippingLabelOffset { get; } = DefaultShippingLabelOffset;
    public int HorizontalUspsShippingLabelOffset { get; } = DefaultHorizontalUspsShippingLabelOffset;

    // Device Labels Defaults
    public int DeviceLabelOffset { get; } = DefaultDeviceLabelOffset;



    // Legacy USPS Return Label Y positions
    public int UspsImpbBarcodeWithOffset => Math.Max(0, ReturnLabelRelativeCoords.UspsImpbBarcode + ReturnLabelOffset);
    public int UspsReadableBarcodeWithOffset => Math.Max(0, ReturnLabelRelativeCoords.UspsReadableBarcode + ReturnLabelOffset);

    // Horizontal USPS Return Label Y positions
    public int HorizontalReturnShippingTypeCodeBorderWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.ShippingTypeCodeBorder + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnShippingTypeCodeLetterWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.ShippingTypeCodeLetter + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnPostageBoxBorderWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.PostageBoxBorder + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnPostageBoxTextWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.PostageBoxText + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnPackageTypeBannerWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.PackageTypeBanner + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnPackageTypeTMTextWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.PackageTypeTMText + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnPackageTypeReturnTextWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.PackageTypeReturnText + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnAddressWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.ReturnAddress + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnHazmatVerbiageWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.HazmatVerbiage + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnShippingAddressWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.ShippingAddress + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnUspsDataMatrixBarcodeWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.UspsDataMatrix + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnLabelHeaderWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.LabelHeader + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnUspsImbpBarcodeWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.UspsImbpBarcode + HorizontalUspsReturnLabelOffset);
    public int HorizontalReturnHumanReadableBarcodeWithOffset => Math.Max(0, HorizontalUspsReturnLabelRelativeCoords.HumanReadableBarcode + HorizontalUspsReturnLabelOffset);



    // Legacy UPS MI Shipping Label Y positions
    public int ReturnAddresseWithOffset => Math.Max(0, ShippingLabelRelativeCoords.ReturnAddress + ShippingLabelOffset);
    public int PostageBoxBordersWithOffset => Math.Max(0, ShippingLabelRelativeCoords.PostageBoxBorders + ShippingLabelOffset);
    public int PostageBoxTxtWithOffset => Math.Max(0, ShippingLabelRelativeCoords.PostageBoxTxt + ShippingLabelOffset);
    public int ForwardServiceMessageWithOffset => Math.Max(0, ShippingLabelRelativeCoords.ForwardServiceMessage + ShippingLabelOffset);
    public int ShippingAndToTxtWithOffset => Math.Max(0, ShippingLabelRelativeCoords.ShippingAndToTxt + ShippingLabelOffset);
    public int ShippingAddressBlockWithOffset => Math.Max(0, ShippingLabelRelativeCoords.ShippingAddressBlock + ShippingLabelOffset);
    public int UpsDataMatrixTopBottomBordersWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsDataMatrixTopBottomBorders + ShippingLabelOffset);
    public int UpsDataMatrixMiddleLineWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsDataMatrixMiddleLine + ShippingLabelOffset);
    public int UpsDataMatrixItselfWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsDataMatrixItself + ShippingLabelOffset);
    public int UpsDataMatrixDataStrLeftStartingPosWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsDataMatrixDataStrLeftStartingPos + ShippingLabelOffset);
    public int UpsImpbBarcodeTopBottomBordersWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsImpbBarcodeTopBottomBorders + ShippingLabelOffset);
    public int UpsBarcodeTitleWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsBarcodeTitle + ShippingLabelOffset);
    public int UpsTrackingBarcodeWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsTrackingBarcode + ShippingLabelOffset);
    public int UpsTrackingBarcodeReadableTxtWithOffset => Math.Max(0, ShippingLabelRelativeCoords.UpsTrackingBarcodeReadableTxt + ShippingLabelOffset);

    // Horizontal USPS Shipping Label Y positions
    public int HorizontalShippingTypeCodeBorderWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.ShippingTypeCodeBorder + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingTypeCodeLetterWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.ShippingTypeCodeLetter + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingPostageBoxBorderWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.PostageBoxBorder + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingPostageBoxTextWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.PostageBoxText + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingPackageTypeBannerWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.PackageTypeBanner + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingPackageTypeTMTextWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.PackageTypeTMText + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingReturnAddressWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.ReturnAddress + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingHazmatVerbiageWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.HazmatVerbiage + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingUspsDataMatrixBarcodeWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.UspsDataMatrix + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingShippingAddressWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.ShippingAddress + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingLabelHeaderWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.LabelHeader + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingUsps1DBarcodeWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.Usps1DBarcode + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingHumanReadableBarcodeWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.HumanReadableBarcode + HorizontalUspsShippingLabelOffset);
    public int HorizontalShippingPackageIdTextWithOffset => Math.Max(0, HorizontalUspsShippingLabelRelativeCoords.PackageId + HorizontalUspsShippingLabelOffset);

    


    // Device Label Y positions
    public int DeviceLabelRightWithOffset => Math.Max(0, DeviceLabelRelativeCoords.DeviceLabelRight + DeviceLabelOffset);
    public int DeviceLabelYearMakeModelWithOffset => Math.Max(0, DeviceLabelRelativeCoords.DeviceLabelYearMakeModel + DeviceLabelOffset);
    public int DeviceLabelPlugInDeviceTxtWithOffset => Math.Max(0, DeviceLabelRelativeCoords.DeviceLabelPlugInDeviceTxt + DeviceLabelOffset);
    public int DeviceLabelDeviceSerialNumberWithOffset => Math.Max(0, DeviceLabelRelativeCoords.DeviceLabelDeviceSerialNumber + DeviceLabelOffset);
    public int DeviceLabelOrderNumberWithOffset => Math.Max(0, DeviceLabelRelativeCoords.DeviceLabelOrderNumber + DeviceLabelOffset);


    public LabelYpositionValues(int returnLabelYposOffsetOverride, int shippingLabelYposOffsetOverride, int deviceLabelYposOffsetOverride,
        int horizontalUspsReturnLabelOffsetOverride, int horizontalUspsShippingLabelOffsetOverride)
    {
        ReturnLabelOffset = returnLabelYposOffsetOverride;
        ShippingLabelOffset = shippingLabelYposOffsetOverride;
        DeviceLabelOffset = deviceLabelYposOffsetOverride;

        HorizontalUspsReturnLabelOffset = horizontalUspsReturnLabelOffsetOverride;
        HorizontalUspsShippingLabelOffset = horizontalUspsShippingLabelOffsetOverride;   
    }

    public LabelYpositionValues() { }

    /// <summary>
    /// Y Coordinates for elements in the return label relative to other elements on the label
    /// </summary>
    private static class ReturnLabelRelativeCoords
    {
        public const int UspsImpbBarcode = 37;
        public const int UspsReadableBarcode = 0;
    }

    private static class HorizontalUspsReturnLabelRelativeCoords
    {
        public const int ShippingTypeCodeBorder = 750;
        public const int ShippingTypeCodeLetter = 775;
        public const int PostageBoxBorder = 54;
        public const int PostageBoxText = 60;
        public const int PackageTypeBanner = -10;
        public const int PackageTypeTMText = 290;
        public const int PackageTypeReturnText = 140;
        public const int ReturnAddress = 663;
        public const int HazmatVerbiage = 263;
        public const int UspsDataMatrix = 773;
        public const int ShippingAddress = 273;
        public const int LabelHeader = 115;
        public const int UspsImbpBarcode = 90;
        public const int HumanReadableBarcode = 60;
    }   



    /// <summary>
    /// Y Coordinates for elements in the shipping label relative to other elements on the label
    /// </summary>
    private static class ShippingLabelRelativeCoords
    {
        public const int ReturnAddress = 870;
        public const int PostageBoxBorders = 20;
        public const int PostageBoxTxt = 40;
        public const int ForwardServiceMessage = 20;
        public const int ShippingAndToTxt = 970;
        public const int ShippingAddressBlock = 516;
        public const int UpsDataMatrixTopBottomBorders = 20;
        public const int UpsDataMatrixMiddleLine = 320;
        public const int UpsDataMatrixItself = 340;
        public const int UpsDataMatrixDataStrLeftStartingPos = 20;
        public const int UpsImpbBarcodeTopBottomBorders = 0;
        public const int UpsBarcodeTitle = 0;
        public const int UpsTrackingBarcode = 228;
        public const int UpsTrackingBarcodeReadableTxt = 0;
    }

    private static class HorizontalUspsShippingLabelRelativeCoords
    {
        public const int ShippingTypeCodeBorder = 956;
        public const int ShippingTypeCodeLetter = 981;
        public const int PostageBoxBorder = 50;
        public const int PostageBoxText = 24;
        public const int PackageTypeBanner = 20;
        public const int PackageTypeTMText = 288;
        public const int ReturnAddress = 870;
        public const int HazmatVerbiage = 456;
        public const int UspsDataMatrix = 986;
        public const int ShippingAddress = 276;
        public const int LabelHeader = -9;
        public const int Usps1DBarcode = 191;
        public const int HumanReadableBarcode = 0;
        public const int PackageId = -39;
    }  

    /// <summary>
    /// Y Coordinates for elements in the device label relative to other elements on the label
    /// </summary>
    private static class DeviceLabelRelativeCoords
    {
        public const int DeviceLabelRight = 0;
        public const int DeviceLabelYearMakeModel = 35;
        public const int DeviceLabelPlugInDeviceTxt = 150;
        public const int DeviceLabelDeviceSerialNumber = 195;
        public const int DeviceLabelOrderNumber = 235;
    }
}
