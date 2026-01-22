using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfValueCalculator;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IValueCalculatorService
    {
        Task<GetValueCalculatorValuesResponse> GetCalculatedValues(int participantSeqId);
    }

    public class ValueCalculatorService : WcfService<ValueCalculatorClient>, IValueCalculatorService
    {
        public ValueCalculatorService(ILogger<ValueCalculatorService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateValueCalculatorClient) { }


        public async Task<GetValueCalculatorValuesResponse> GetCalculatedValues(int participantSeqId)
        {
            using var client = CreateClient();
            var response = await client.HandledCall(() => client.GetValuesByParticipantSeqIDAsync(new GetValueCalculatorValuesByParticipantSeqIDRequest
            {
                ParticipantSeqID = participantSeqId
            }), logger);
            return response;
        }
    }
}

