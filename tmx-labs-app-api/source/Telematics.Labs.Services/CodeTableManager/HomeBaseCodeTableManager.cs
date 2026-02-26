using System.Data;
using Progressive.Telematics.Labs.Shared.CodeTableManager;
using Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

namespace Progressive.Telematics.Labs.Services.CodeTableManager;

public class HomeBaseCodeTableManager : CoreCodeTableManager, IHomeBaseCodeTableManager
{
    private readonly HomeBaseCodeTableProvider _provider;

    public HomeBaseCodeTableManager(HomeBaseCodeTableProvider provider)
    {
        _provider = provider;
    }

    public override ICodeTableProvider Provider
    {
        get { return _provider; }
    }

    public DataSet TypedDataSet
    {
        get { return CodeTables; }
    }
}
