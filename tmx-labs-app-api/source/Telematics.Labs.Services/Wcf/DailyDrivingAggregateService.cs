using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Labs.Shared;
using Progressive.Telematics.Labs.Shared.Attributes;
using WcfDrivingDailyAggregateService;

namespace Progressive.Telematics.Labs.Services.Wcf
{
    [SingletonService]
    public interface IDailyDrivingAggregateService
    {
        Task<GetDrivingDailyAggregateResponse> GetTripStats2008(int participantSeqId, DateTime startDate, DateTime endDate);
    }

    public class DailyDrivingAggregateService : WcfService<GetDrivingDailyAggregateServiceClient>, IDailyDrivingAggregateService
    {
        public DailyDrivingAggregateService(ILogger<DailyDrivingAggregateService> logger, IWcfServiceFactory factory)
            : base(logger, factory.CreateDrivingDailyAggregateClient) { }

        public async Task<GetDrivingDailyAggregateResponse> GetTripStats2008(int participantSeqId, DateTime startDate, DateTime endDate)
        {
            using var loggingScope = logger.BeginPropertyScope((LoggingConstants.ParticipantSeqId, participantSeqId));

            using var client = CreateClient();
            var response = await client.HandledCall(
                () => client.GetAsync(new GetDrivingDailyAggregateRequest
                {
                    ParticipantSeqID = participantSeqId,
                    Begin = startDate,
                    End = endDate
                }),
                logger,
                $"Error returned from the {nameof(DailyDrivingAggregateService)}");

            return response;
        }
    }
}

