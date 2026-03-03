using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Admin.Shared.Attributes;
using WcfTransactionAuditLogService;

namespace Progressive.Telematics.Admin.Services.Wcf
{
    [SingletonService]
    public interface ITransactionAuditLogService
    {
        Task<AddTALResponse> AddAuditLog(AddTALRequest auditLogRequest);
    }

    public class TransactionAuditLogService : WcfService<WcfTransactionAuditLogService.TransactionAuditLogServiceClient>, ITransactionAuditLogService
    {
        public TransactionAuditLogService(ILogger<TransactionAuditLogService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateTransactionAuditLogServiceClient) { }

        public async Task<AddTALResponse> AddAuditLog(AddTALRequest auditLogRequest)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.AddTALAsync(auditLogRequest), logger);
            return response;
        }
    }
}
