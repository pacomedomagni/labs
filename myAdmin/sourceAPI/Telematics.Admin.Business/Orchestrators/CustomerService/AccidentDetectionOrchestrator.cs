using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Progressive.AppLogger.NetCore;
using Progressive.Telematics.Admin.Business.ResponseModels.CustomerService.AccidentDetection;
using Progressive.Telematics.Admin.Services.Api;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;

namespace Progressive.Telematics.Admin.Business.Orchestrators.CustomerService
{
    [SingletonService]
    public interface IAccidentDetectionOrchestrator
    {
        Task<UnenrollResponse> Unenroll(string telematicsId, string unenrollReason);
    }

    public class AccidentDetectionOrchestrator : IAccidentDetectionOrchestrator
    {
        private readonly IClaimsParticipantManagementApi claimsParticipantManagementApi;
        private readonly ILogger<RegistrationOrchestrator> logger;

        public AccidentDetectionOrchestrator(
            IClaimsParticipantManagementApi claimsParticipantManagementApi,
            ILogger<RegistrationOrchestrator> logger)
        {
            this.claimsParticipantManagementApi = claimsParticipantManagementApi;
            this.logger = logger;
        }

        public async Task<UnenrollResponse> Unenroll(string telematicsId, string unenrollReason)
        {
            using var loggingScope = logger.BeginPropertyScope(
                (LoggingConstants.TelematicsId, telematicsId));

            try
            {
                var updateSuccessful = await claimsParticipantManagementApi.Unenroll(telematicsId, unenrollReason);

                if (!updateSuccessful)
                {
                    logger.LogError(LoggingEvents.AccidentDetectionOrchestrator_Unenroll_Failed, "Failed to unenroll participant {telematicsId}", telematicsId);
                    return new UnenrollResponse.Failure();
                }


                return new UnenrollResponse.Success();
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.AccidentDetectionOrchestrator_Unenroll_Unknown, ex, $"Unknown error occurred in {nameof(Unenroll)}");
                return new UnenrollResponse.Failure();
            }
        }
    }
}
