using Progressive.Telematics.Labs.Services.Wcf;
using Progressive.Telematics.Labs.Shared.Utils;

namespace Progressive.Telematics.Labs.Services.CodeTableManager;

/// <summary>
/// Factory for creating CodeTable managers and providers.
/// All WCF-dependent code is now in the Services project, eliminating type ambiguity issues.
/// </summary>
public static class CodeTableProviderFactory
{
    public static HomeBaseCodeTableProvider CreateHomeBaseCodeTableProvider(
        IWcfServiceFactory wcfFactory,
        IConfigSettings configSettings)
    {
        var wcfClient = wcfFactory.CreateWCFHomeBaseCodeTablesServiceClient();
        return new HomeBaseCodeTableProvider(wcfClient, configSettings);
    }

    public static HomeBaseCodeTableManager CreateHomeBaseCodeTableManager(
        IWcfServiceFactory wcfFactory,
        IConfigSettings configSettings)
    {
        var provider = CreateHomeBaseCodeTableProvider(wcfFactory, configSettings);
        return new HomeBaseCodeTableManager(provider);
    }

    public static MyScoreCodeTableProvider CreateMyScoreCodeTableProvider(
        IWcfServiceFactory wcfFactory,
        IConfigSettings configSettings)
    {
        var wcfClient = wcfFactory.CreateWCFCodeTablesServiceClient();
        return new MyScoreCodeTableProvider(wcfClient, configSettings);
    }

    public static MyScoreCodeTableManager CreateMyScoreCodeTableManager(
        IWcfServiceFactory wcfFactory,
        IConfigSettings configSettings)
    {
        var provider = CreateMyScoreCodeTableProvider(wcfFactory, configSettings);
        return new MyScoreCodeTableManager(provider);
    }
}
