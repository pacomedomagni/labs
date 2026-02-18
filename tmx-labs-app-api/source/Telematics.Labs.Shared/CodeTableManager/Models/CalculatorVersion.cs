namespace FulfillmentWeb.Shared.CodeTableManager.Models;

public class CalculatorVersion
{
    public string Product { get; set; }
    public string State { get; set; }
    public string RateRevision { get; set; }
    public string Channel { get; set; }
    public string InputCalculatorVersion { get; set; }
    public string DiscountCalculatorVersion { get; set; }
    public string ValueCalculatorVersion { get; set; }
    public string ParticipationType { get; set; }
    public int? ConnectPercentRequired { get; set; }
    public int? AmnestyPercentAllowed { get; set; }
    public int? ConnectDaysRequired { get; set; }
    public decimal? DisconnectsPerDayAllowed { get; set; }
    public int? MonitoringTypeCode { get; set; }
    public int? HomeBaseDeviceRuleCode { get; set; }
}
