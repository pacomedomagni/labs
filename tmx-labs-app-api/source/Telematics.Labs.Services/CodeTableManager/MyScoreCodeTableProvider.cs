using System;
using System.Data;
using Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;
using Progressive.Telematics.Labs.Shared.Utils;
using WCFCodeTablesService;

namespace Progressive.Telematics.Labs.Services.CodeTableManager;

public class MyScoreCodeTableProvider : ICodeTableProvider
{
    private const int cEXPIRATIONSECONDS = 1000;
    private const string cCODETABLEDATASETKEY = "BASECODETABLEKEY";
    private readonly ICodeTablesService _service;
    private readonly IConfigSettings _configSettings;

    public MyScoreCodeTableProvider(ICodeTablesService codeTableService, IConfigSettings configSettings)
    {
        _service = codeTableService;
        _configSettings = configSettings;
    }

    public string Key { get { return cCODETABLEDATASETKEY; } }

    public int ExpirationSeconds { get { return GetExpirationSeconds(); } }

    public DataSet CodeTableDataSet { get { return GetCodeTableDataSet(); } }

    private int GetExpirationSeconds()
    {
        var expirationValue = _configSettings.GetConfigValueAsync(
            "CodeTableManagerExpirationSeconds",
            applicationCode: 36,
            slotName: "NoSlot").GetAwaiter().GetResult();

        int expirationSeconds;
        if (!int.TryParse(expirationValue, out expirationSeconds))
        {
            expirationSeconds = cEXPIRATIONSECONDS;
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
