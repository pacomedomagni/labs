using System.Collections.Generic;

namespace FulfillmentWeb.Shared.CodeTableManager.Models;

public class CodeTableData
{
    public List<CalculatorVersion> CalculatorVersions { get; set; } = new();
    public List<ProgramRules> ProgramRules { get; set; } = new();
    public List<XirgoVersion> XirgoVersions { get; set; } = new();
    public List<XirgoRule> XirgoRules { get; set; } = new();
    public List<StateRateRevisionCode> StateRateRevisionCodes { get; set; } = new();
    public List<Restricted2GZipCode> Restricted2GZipCodes { get; set; } = new();
}
