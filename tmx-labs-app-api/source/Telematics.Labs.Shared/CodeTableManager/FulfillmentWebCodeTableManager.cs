using System.Threading.Tasks;
using FulfillmentWeb.Shared.CodeTableManager.Models;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace FulfillmentWeb.Shared.CodeTableManager
{
    [SingletonService]
    public class FulfillmentWebCodeTableManager : IFulfillmentWebCodeTableManager 
    {
        private readonly FulfillmentWebCodeTableProvider _provider;

        public FulfillmentWebCodeTableManager(FulfillmentWebCodeTableProvider provider)
        {
            _provider = provider;
        }

        public Task<CodeTableData> GetCodeTablesAsync()
        {
            return _provider.GetCodeTablesAsync();
        }
    }
}
