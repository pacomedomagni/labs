using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Shared.Configs;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Business.Resources;

namespace Progressive.Telematics.Admin.Services.Database
{
    [SingletonService]
    public interface ISupportDAL
    {
        Task<List<IncidentResolutionDataModel>> GetIncidentResolutions();
        Task AddIncidentResolution(IncidentResolutionDataModel incidentResolution);
        Task DeleteIncidentResolution(IncidentResolutionDataModel incidentResolution);
        Task UpdateIncidentResolution(IncidentResolutionDataModel incidentResolution);
    }

    public class SupportDAL : DbContext, ISupportDAL
    {
        private readonly IHttpContextAccessor _contextAccessor;

        public SupportDAL(
            ILogger<SupportDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<EnvironmentPrefixes> envConfig,
            IHttpContextAccessor contextAccessor
        )
            : base(logger, envConfig.Value.SQL, config.Value.Support)
        {
            _contextAccessor = contextAccessor;
        }

        public async Task<List<IncidentResolutionDataModel>> GetIncidentResolutions()
        {
            var storedProc = "dbo.usp_IncidentResolution_SelectAll";
            var data = await ExecuteStoredProcedureAsync<IncidentResolutionDataModel>(storedProc, null);
            return data?.ToList();
        }

        public async Task AddIncidentResolution(IncidentResolutionDataModel incidentResolution)
        {
            var storedProc = "dbo.usp_IncidentResolution_Insert";
            var parms = new DynamicParameters()
                .Parameter("@Parm_KBAId", incidentResolution.KBAId)
                .Parameter("@Parm_KBADescription", incidentResolution.KBADescription)
                .Parameter("@Parm_StepNumber", incidentResolution.StepNumber)
                .Parameter("@Parm_StoredProcedureName", incidentResolution.StoredProcedureName)
                .Parameter("@Parm_LastChangeUserId", _contextAccessor.CurrentUser());

            try
            {
                await ExecuteStoredProcedureAsync<int>(storedProc, parms, true);
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.SupportDal_StoredProcedureFailed, ex, $"Error occurred in {nameof(AddIncidentResolution)}");
                throw new Exception("The server was unable to process the request due to an internal error.");
            }
        }

        public async Task DeleteIncidentResolution(IncidentResolutionDataModel incidentResolution)
        {
            var storedProc = "dbo.usp_IncidentResolution_DeleteByPrimaryKey";
            var parms = new DynamicParameters().Parameter("@Parm_IncidentResolutionSeqId", incidentResolution.IncidentResolutionSeqId);

            try
            {
                await ExecuteStoredProcedureAsync<int>(storedProc, parms, true);
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.SupportDal_StoredProcedureFailed, ex, $"Error occurred in {nameof(DeleteIncidentResolution)}");
                throw new Exception("The server was unable to process the request due to an internal error.");
            }
        }

        public async Task UpdateIncidentResolution(IncidentResolutionDataModel incidentResolution)
        {
            var storedProc = "dbo.usp_IncidentResolution_UpdateByPrimaryKey";
            var parms = new DynamicParameters()
                .Parameter("@Parm_IncidentResolutionSeqId", incidentResolution.IncidentResolutionSeqId)
                .Parameter("@Parm_KBAId", incidentResolution.KBAId)
                .Parameter("@Parm_KBADescription", incidentResolution.KBADescription)
                .Parameter("@Parm_StepNumber", incidentResolution.StepNumber)
                .Parameter("@Parm_StoredProcedureName", incidentResolution.StoredProcedureName)
                .Parameter("@Parm_LastChangeUserId", _contextAccessor.CurrentUser());

            try
            {
                var result = await ExecuteStoredProcedureAsync<int>(storedProc, parms, true);
            }
            catch (Exception ex)
            {
                logger.LogError(LoggingEvents.SupportDal_StoredProcedureFailed, ex, $"Error occurred in {nameof(UpdateIncidentResolution)}");
                throw new Exception("The server was unable to process the request due to an internal error.");
            }

        }
    }
}
