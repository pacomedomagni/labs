using System.Threading.Tasks;
using FulfillmentWeb.Shared.CodeTableManager.Models;
using Progressive.Telematics.Labs.Shared.Attributes;

namespace FulfillmentWeb.Shared.CodeTableManager
{
    [SingletonService]
    public interface IFulfillmentWebCodeTableManager
    {
        Task<CodeTableData> GetCodeTablesAsync();
    }
}
