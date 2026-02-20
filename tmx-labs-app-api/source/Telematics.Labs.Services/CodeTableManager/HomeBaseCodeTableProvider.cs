using System;
using System.Data;
using Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;
using Progressive.Telematics.Labs.Shared.Utils;
using WCFHomeBaseCodeTablesService;

namespace Progressive.Telematics.Labs.Services.CodeTableManager;

public class HomeBaseCodeTableProvider : ICodeTableProvider
{
    private const int cEXPIRATIONSECONDS = 1000;
    private const string cCODETABLEDATASETKEY = "B0D5E47E-6BDC-427A-9851-F5D1DE348C39";
    private readonly ICodeTablesService _service;
    private readonly IConfigSettings _configSettings;

    public HomeBaseCodeTableProvider(ICodeTablesService codeTableService, IConfigSettings configSettings)
    {
        _service = codeTableService;
        _configSettings = configSettings;
    }

    public string Key { get { return cCODETABLEDATASETKEY; } }

    public int ExpirationSeconds { get { return GetExpirationSeconds(); } }

    public DataSet CodeTableDataSet { get { return GetCodeTableDataSet(); } }

    private int GetExpirationSeconds()
    {
        int expirationSeconds;
        try
        {
            var expirationValue = _configSettings.GetConfigValueAsync(
                "CodeTableManagerExpirationSeconds",
                applicationCode: 36,
                slotName: "NoSlot").GetAwaiter().GetResult();

            if (!int.TryParse(expirationValue, out expirationSeconds))
            {
                expirationSeconds = cEXPIRATIONSECONDS;
            }
        }
        catch
        {
            expirationSeconds = 6000;
        }

        return expirationSeconds;
    }

    private DataSet GetCodeTableDataSet()
    {
        var response = _service.GetCodeTablesAsync(new GetCodeTablesRequest()).GetAwaiter().GetResult();
        var result = response.GetCodeTablesResult;
        if (result.ResponseStatus == ResponseStatus.Success)
        {
            var xmlElement = result.CodeTableDataSet;
            if (xmlElement != null)
            {
                var dataSet = new DataSet();
                using (var reader = new System.Xml.XmlNodeReader(xmlElement))
                {
                    dataSet.ReadXml(reader);
                }
                return dataSet;
            }
        }

        throw new ApplicationException("Cannot Retrieve Code Tables");
    }
}
