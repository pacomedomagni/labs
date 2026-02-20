using System.Data;
using Progressive.Telematics.Labs.Shared.CodeTableManager;
using Progressive.Telematics.Labs.Shared.CodeTableManager.CoreCodeTableManager;

namespace Progressive.Telematics.Labs.Services.CodeTableManager;

public class MyScoreCodeTableManager : CoreCodeTableManager, IMyScoreCodeTableManager
{
    private readonly MyScoreCodeTableProvider _provider;

    public MyScoreCodeTableManager(MyScoreCodeTableProvider provider)
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
