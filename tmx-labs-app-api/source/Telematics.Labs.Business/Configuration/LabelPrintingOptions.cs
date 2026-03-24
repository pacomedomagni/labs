namespace Progressive.Telematics.Labs.Business.Configuration;

public class LabelPrintingOptions
{
    public const string SectionName = "LabelPrinting";

    /// <summary>
    /// Indicates whether USPS labels should be used (true) or UPS Mail Innovations (false)
    /// </summary>
    public bool IsUspsEnabled { get; set; } = true;

    /// <summary>
    /// Indicates whether blank labels are being used (true) or pre-printed labels (false)
    /// </summary>
    public bool IsUsingBlankLabels { get; set; } = true;

    /// <summary>
    /// Number of devices that can fit in a single shipping box
    /// </summary>
    public int BoxCapacity { get; set; } = 2;

    /// <summary>
    /// Port number for connecting to label printers
    /// </summary>
    public int PrinterPort { get; set; } = 9100;

    /// <summary>
    /// Whether to ignore address validation errors from USPS
    /// </summary>
    public bool IgnoreBadAddress { get; set; } = true;

    /// <summary>
    /// Customer cost center code for UPS Mail Innovations (if needed)
    /// </summary>
    public string CustomerCostCenter { get; set; } = "V332M";

    /// <summary>
    /// Program code for tracking number generation
    /// </summary>
    public int ProgramCode { get; set; } = 1;
}
