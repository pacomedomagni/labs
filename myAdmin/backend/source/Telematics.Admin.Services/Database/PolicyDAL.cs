using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Progressive.Telematics.Admin.Business.Resources;
using Progressive.Telematics.Admin.Business.Resources.Resources.Shared;
using Progressive.Telematics.Admin.Business.Resources.Resources.Snapshot;
using Progressive.Telematics.Admin.Services.Models;
using Progressive.Telematics.Admin.Services.Models.UbiDTO;
using Progressive.Telematics.Admin.Shared;
using Progressive.Telematics.Admin.Shared.Attributes;
using Progressive.Telematics.Admin.Shared.Configs;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace Progressive.Telematics.Admin.Services.Database
{
    [SingletonService]
    public interface IPolicyDAL
    {
        Task<List<ExcludedDateRange>> GetExcludedDateRanges(string participantId);
        Task<ParticipantScoringData> GetParticipantScoringData(int participantSeqId);
        Task<List<TransactionAuditLog>> GetTransactionAuditLogs(string policyNumber);
        Task<List<TripSummaryDaily>> GetTripStats2008(int participantSeqId, DateTime startDate, DateTime endDate);
        Task<List<MobileContext>> GetMobileContexts(int participantSeqId);
        Task<List<TelematicsDriver>> GetTelematicsDriversByPolicyNumber(string policyNumber);
        Task<InitialParticipantScoreInProcess> GetInitialScoreInProcess(int participantSeqId);
        Task<bool> ReEnrollInMobile(string policyNumber, string participantId, string mobileId);
        Task<String> GetPolicyNumberAsync(Guid? participantExternalId, int? deviceSeqId);
        Task<IEnumerable<ParticipantJunctionDTO>> GetParticipantJunctionData(string policyNumber);
        Task<PolicyDTO> GetSupportPolicyData(string policyNumber);
        Task<IEnumerable<EventDTO>> GetParticipantDeviceEvents(int participantSeqId);
        Task<IEnumerable<TripSummaryDTO>> GetTripSummary(int participantSeqId);
        Task<GetTEByTripSeqIDResponseDTO> GetTripEvents(long tripSeqId);
        Task<GetTDByTripSeqIDResponse> GetTripEventDetails(long tripSeqId, int algorithm, string filter);
        Task<DateTime?> GetUBIFeatureActivationDateTime(string telematicsId);
        Task<string> GetPolicyTransactionErrorAsync(string policyNumber);
        Task UpdateAdminStatusToActive(string policyNumber, string participantID, string deviceSerialNumber, string name);
        Task UpdateAdminStatusForOptOut(string policyNumber, string participantID, string name);
        Task<int?> GetMostRecentOrderSeqIdByDeviceSerialNumber(string deviceSerialNumber);
		Task<SnapshotMobileParticipant> GetDriverDataByParticipantExternalId(string participantExternalId);
		Task<SPParameter[]> GetStoredProcedureParameters(string storedProcedureName);
        Task<ExecuteIncidentResolutionResponse> ExecuteStoredProcedure(string kBAId, string storedProcedureName, SPParameter[] storedProcedureParameters);
    }

    [SingletonService]
    public interface IScoringAlgorithmDAL
    {
        Task<IEnumerable<ScoringAlgorithmData>> GetScoringAlgorithmsAsync();
    }

    public class PolicyDAL : DbContext, IPolicyDAL, IScoringAlgorithmDAL
    {
        private readonly IHttpContextAccessor contextAccessor;
        private readonly IOptions<TranactionAlerts> transactionAlerts;

        public PolicyDAL(
            ILogger<PolicyDAL> logger,
            IOptions<ConnectionStringsConfig> config,
            IOptions<TranactionAlerts> transConfig,
            IOptions<EnvironmentPrefixes> envConfig,
            IHttpContextAccessor contextAccessor
        )
            : base(logger, envConfig.Value.SQL, config.Value.Policy)
        {
            this.contextAccessor = contextAccessor;
            this.transactionAlerts = transConfig;
        }

        public async Task<List<ExcludedDateRange>> GetExcludedDateRanges(string participantId)
        {
            var query =
                @"SELECT
							RangeStart,
							RangeEnd,
							ExcludedDateRangeReasonCode,
							edr.LastChangeDateTime,
							[Description],
							ModByUserId
						FROM
							dbo.ExcludedDateRange edr
							INNER JOIN dbo.Participant part ON part.ParticipantSeqID = edr.ParticipantSeqID
						WHERE
							ParticipantID = @participantId
						ORDER BY RangeStart";
            var parms = new { participantId };
            var data = await ExecuteQueryAsync<ExcludedDateRange>(query, parms);
            return data?.ToList();
        }

        public async Task<ParticipantScoringData> GetParticipantScoringData(int participantSeqId)
        {
            var query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                        SELECT TOP (1) 
							p.State, 
							part.DeviceExperienceTypeCode, 
							part.MobileSummarizerVersionCode, 
							part.MonitoringCompleteConnectDays, 
							algo.MobileValueCalculatorCode, 
							algo.OBD2ValueCalculatorCode, 
							algo.RatedDistractedDrivingInd 
						FROM Participant part 
						INNER JOIN ParticipantJunction pj on part.ParticipantSeqID = pj.ParticipantSeqID 
						INNER JOIN PolicyPeriod pp on pj.PolicyPeriodSeqID = pp.PolicyPeriodSeqID 
						INNER JOIN Policy p on pp.PolicySeqID = p.PolicySeqID 
						INNER JOIN ScoringAlgorithm algo on part.ScoringAlgorithmCode = algo.Code 
						WHERE pj.ParticipantSeqID = @participantSeqId";
            var parms = new { participantSeqId };

            var data = await ExecuteQueryAsync<ParticipantScoringData>(query, parms);
            return data?.FirstOrDefault();
        }

        public async Task<List<TransactionAuditLog>> GetTransactionAuditLogs(string policyNumber)
        {
            var storedProc = "dbo.usp_TransactionAuditLog_SelectAllByPolicyNumber";
            var parms = new DynamicParameters().Parameter("@Parm_PolicyNumber", policyNumber);

            var data = await ExecuteStoredProcedureAsync<TransactionAuditLog>(storedProc, parms);
            return data?.ToList();
        }

        public async Task<List<TripSummaryDaily>> GetTripStats2008(
            int participantSeqId,
            DateTime startDate,
            DateTime endDate
        )
        {
            var storedProc = "dbo.usp_Reports_ChartsTripsLogAggregate";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId)
                .Parameter("@Parm_ReportStartDate", startDate.ToString("s"))
                .Parameter("@Parm_ReportEndDate", endDate.ToString("s"));

            var data = await ExecuteStoredProcedureAsync<TripSummaryDaily>(storedProc, parms);
            return data?.ToList();
        }

        public async Task<List<MobileContext>> GetMobileContexts(int participantSeqId)
        {
            var storedProc = "dbo.usp_MobileConnect_SelectByParticipantSeqIDWithPaging";
            var parms = new DynamicParameters()
                .Parameter("@Parm_ParticipantSeqID", participantSeqId)
                .Parameter("@Parm_StartDateTime", DateTime.Now.AddDays(-180).ToString())
                .Parameter("@Parm_EndDateTime", DateTime.Now.ToString())
                .Parameter("@Parm_Page", 1)
                .Parameter("@Parm_PageSize", 10000);

            var data = await ExecuteStoredProcedureAsync<MobileContext>(storedProc, parms);
            return data?.ToList();
        }

        public async Task<List<TelematicsDriver>> GetTelematicsDriversByPolicyNumber(string policyNumber)
        {
            var query =
            @"SELECT DISTINCT 
	            part.ParticipantExternalId,
	            d.DriverFirstName,
	            d.DriverLastName
            FROM
	            dbo.[Policy] po
	            INNER JOIN dbo.[PolicyPeriod] pp on pp.PolicySeqId = po.PolicySeqId
	            INNER JOIN dbo.[ParticipantJunction] pj on pj.PolicyPeriodSeqId = pp.PolicyPeriodSeqId
	            INNER JOIN dbo.[Drivers] d on d.DriverSeqId = pj.DriverSeqId
	            INNER JOIN dbo.[Participant] part on part.ParticipantSeqId = pj.ParticipantSeqId
            WHERE
	            po.PolicyNumber = @policyNumber
	            AND pj.JunctionVersion = 1
                AND part.ParticipantExternalId is not null";
            var parameter = new { policyNumber = new DbString { Value = policyNumber, IsAnsi = true } };

            var data = await ExecuteQueryAsync<TelematicsDriver>(query, parameter, true);
            return data?.ToList();
        }

        public async Task<InitialParticipantScoreInProcess> GetInitialScoreInProcess(
            int participantSeqId
        )
        {
            var storedProc = "dbo.usp_InitialParticipationScoreInProcess_SelectByParticipant";
            var parms = new DynamicParameters().Parameter(
                "@Parm_ParticipantSeqID",
                participantSeqId
            );

            var data = await ExecuteStoredProcedureAsync<InitialParticipantScoreInProcess>(
                storedProc,
                parms
            );
            return data?.FirstOrDefault();
        }

        public async Task<bool> ReEnrollInMobile(
            string policyNumber,
            string participantId,
            string mobileId
        )
        {
            var storedProc = "usp_IncidentResolution_ReenrollInMobile_UpdateAdminStatusToActive";
            var parms = new DynamicParameters()
                .Parameter("@Parm_PolicyNumber", policyNumber)
                .Parameter("@Parm_ParticipantID", participantId)
                .Parameter("@Parm_MobileNumber", mobileId)
                .Parameter("@Parm_UserName", contextAccessor.CurrentUser());
            try
            {
                var data = await ExecuteStoredProcedureAsync<dynamic>($"dbo.{storedProc}", parms);
                return data != null ? true : false;
            }
            catch (Exception ex)
            {
                var start = ex.Message.IndexOf("ERROR_MESSAGE:") + 15;
                var end = ex.Message.IndexOf("USER_MESSAGE:");
                var message = ex.Message
                    .Substring(start, end - start)
                    .Replace(storedProc + ":", string.Empty)
                    .Trim();
                logger.LogError(LoggingEvents.PolicyDal_ReEnrollInMobile, ex, message);
                return false;
            }
        }

        public async Task<String> GetPolicyNumberAsync(
            Guid? participantExternalId,
            int? deviceSeqId = null
        )
        {
            int? participantSeqId;

            var parms = new DynamicParameters().Parameter(
                "@Parm_ParticipantExternalId",
                participantExternalId.ToString()
            );

            var query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                    select  participantSeqId from Participant 
								where participantExternalid =@Parm_ParticipantExternalId";

            var result = await ExecuteQueryAsync<int>(query, parms);
            participantSeqId = result.FirstOrDefault();

            if (participantSeqId == null)
            {
                query =
                    @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                        select participantSeqId from participantJunction pj
								join device d on d.deviceSeqId = pj.deviceSeqId
								where  d.deviceSeqId  = @Parm_DeviceSeqId";
                parms = new DynamicParameters().Parameter("@Parm_DeviceSeqId", deviceSeqId);
                result = await ExecuteQueryAsync<int>(query, parms);
                participantSeqId = result.FirstOrDefault();
            }

            query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                    select  policyNumber from policy p
								join policyPeriod pp on p.policySeqId = pp.policySeqId
								join participantJunction pj  on pp.policyPeriodSeqId = pj.policyPeriodSeqId
								join  Participant part on pj.participantSeqId = part.participantSeqId
								where part.participantSeqId = @Parm_participantSeqId";
            parms = new DynamicParameters().Parameter("@Parm_participantSeqId", participantSeqId);
            var policyNumber = (await ExecuteQueryAsync<string>(query, parms)).FirstOrDefault();

            return policyNumber;
        }

        public async Task<IEnumerable<ParticipantJunctionDTO>> GetParticipantJunctionData(string policyNumber)
        {
            {
                var storedProc = "usp_ParticipantJunction_PH_SelectByPolicyNumber";
                var parms = new DynamicParameters()
                    .Parameter("@Parm_PolicyNumber", policyNumber)
                    .Parameter("@Parm_ParticipantSeqID", null)
                    .Parameter("@Parm_PolicyPeriodSeqID", null)
                    .Parameter("@Parm_VIN", null)
                    .Parameter("@Parm_DeviceSeqID", null)
                    .Parameter("@Parm_JunctionVersion", null);
                try
                {
                    var data = await ExecuteStoredProcedureAsync<ParticipantJunctionDTO>($"dbo.{storedProc}", parms);
                    return data;
                }
                catch (Exception ex)
                {
                    return null;
                }
            }
        }

        public async Task<PolicyDTO> GetSupportPolicyData(string policyNumber)
        {
            var storedProc = "usp_Policy_GetParticipationSummary";
            var parms = new DynamicParameters()
                    .Parameter("@Parm_PolicyNumber", policyNumber);
            try
            {
                var data = await ExecuteStoredProcedureAsync<PolicyDTO>($"dbo.{storedProc}", parms);
                return data.FirstOrDefault();
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<IEnumerable<EventDTO>> GetParticipantDeviceEvents(int participantSeqId)
        {
            var storedProc = "usp_Event_SelectAllByParticipantSeqID";
            var parms = new DynamicParameters()
                    .Parameter("@Parm_ParticipantSeqId", participantSeqId);
            try
            {
                var data = await ExecuteStoredProcedureAsync<EventDTO>($"dbo.{storedProc}", parms);
                return data;
            }
            catch (Exception ex)
            {
                return null;
            }

        }

        public async Task<IEnumerable<TripSummaryDTO>> GetTripSummary(int participantSeqId)
        {
            var storedProc = "usp_TripSummary_SelectByParticipantSeqId";
            var parms = new DynamicParameters()
                    .Parameter("@Parm_ParticipantSeqId", participantSeqId);
            try
            {
                var data = await ExecuteStoredProcedureAsync<TripSummaryDTO>($"dbo.{storedProc}", parms);
                return data;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<GetTEByTripSeqIDResponseDTO> GetTripEvents(long tripSeqId)
        {
            var storedProc = "usp_TripSummary_SelectByParticipantSeqId";
            var parms = new DynamicParameters()
                    .Parameter("@Parm_ParticipantSeqID", tripSeqId)
                    ;
            try
            {
                var data = await ExecuteStoredProcedureAsync<EventDTO>($"dbo.{storedProc}", parms);
                return new GetTEByTripSeqIDResponseDTO
                {
                    TripEventList = data.ToList(),
                    TotalRecordCount = data.Count()

                };
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<GetTDByTripSeqIDResponse> GetTripEventDetails(long tripSeqId, int algorithm, string filter)
        {
            var storedProc = "usp_TripEvent_PH_SelectByTripSeqID";
            var parms = new DynamicParameters()
                    .Parameter("@Parm_TripSeqID", tripSeqId)
                    .Parameter("@Parm_EventDescription", string.IsNullOrEmpty(filter) ? null : filter)
                    .Parameter("@Parm_ScoringAlgorithmCode", algorithm)
                    ;
            try
            {
                var data = await ExecuteStoredProcedureAsync<TripEventDTO>($"dbo.{storedProc}", parms);
                return
                    new GetTDByTripSeqIDResponse
                    {
                        TripEventList = data.ToList(),
                        TotalRecordCount = data.Count()
                    }
                    ;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<DateTime?> GetUBIFeatureActivationDateTime(string telematicsId)
        {
            var query =
                @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED
                    SELECT TOP (1) UBIFeatureActivationDateTime
						FROM Participant  
                        WHERE ParticipantExternalId  = @telematicsId";
            var parms = new { telematicsId };

            var data = await ExecuteQueryAsync<DateTime?>(query, parms);
            return data?.FirstOrDefault();
        }

        public async Task<string> GetPolicyTransactionErrorAsync(string policyNumber)
        {
            var query =
             @"SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED 
                select top 1 TransactionName 
                    from transactionauditlog
                        where
                        policynumber = @policyNumber 
                        and ResultStatus in ('Failure', 'Failed')
                        and TransactionName Not in @transactionAlerts                         
                    order by CreateDate desc";

            var parms = new DynamicParameters()
                   .Parameter("@policyNumber", policyNumber)
                   .Parameter("@transactionAlerts", transactionAlerts.Value.SkipTransactionNames);

            var data = await ExecuteQueryAsync<string?>(query, parms);
            return data.FirstOrDefault();
        }

        public async Task UpdateAdminStatusToActive(string policyNumber, string participantID, string deviceSerialNumber, string name)
        {
			var storedProc = "usp_IncidentResolution_UpdateAdminStatusToActive";
			var parms = new DynamicParameters()
					.Parameter("@Parm_PolicyNumber", policyNumber)
					.Parameter("@Parm_ParticipantID", participantID)
                    .Parameter("@Parm_DeviceSerialNumber", deviceSerialNumber)
					.Parameter("@Parm_UserName", name);
			await ExecuteStoredProcedureAsync<object>($"dbo.{storedProc}", parms);
        }

        public async Task UpdateAdminStatusForOptOut(string policyNumber, string participantID, string name)
        {
            var storedProc = "usp_IncidentResolution_UpdateAdminStatusForOptOut";
            var parms = new DynamicParameters()
                    .Parameter("@Parm_PolicyNumber", policyNumber)
                    .Parameter("@Parm_ParticipantID", participantID)
                    .Parameter("@Parm_UserName", name);
            await ExecuteStoredProcedureAsync<bool>($"dbo.{storedProc}", parms);
        }

        public async Task<IEnumerable<ScoringAlgorithmData>> GetScoringAlgorithmsAsync()
        {
            return await ExecuteStoredProcedureAsync<ScoringAlgorithmData>("dbo.usp_ScoringAlgorithm_SelectAll", new { });
        }
        public async Task<int?> GetMostRecentOrderSeqIdByDeviceSerialNumber(string deviceSerialNumber)
        {
            var serialTable = new DataTable();
            serialTable.Columns.Add("DeviceSerialNumber", typeof(string));
            serialTable.Rows.Add(deviceSerialNumber);

            var parameters = new DynamicParameters();
            parameters.Add(
                "@Parm_DeviceSerialNumberTableValuedParameter",
                serialTable.AsTableValuedParameter("dbo.DeviceSerialNumberTableType")
            );

            var result = await ExecuteStoredProcedureAsync<PersonalLinesOrderDTO>(
                "dbo.usp_DistributorOrderDetail_SelectMostRecentByDeviceSerialNumber", parameters);

            return result?.FirstOrDefault()?.OrderSeqID;
        }

		public async Task<SnapshotMobileParticipant> GetDriverDataByParticipantExternalId(string participantExternalId)
		{
			var storedProc = "dbo.usp_Participant_GetDriverDataByParticipantExternalId";
			var parms = new DynamicParameters().Parameter("@Parm_ParticipantExternalId", participantExternalId);

			var data = await ExecuteStoredProcedureAsync<SnapshotMobileParticipant>(storedProc, parms);
			return data?.ToList().FirstOrDefault();
		}

		public async Task<SPParameter[]> GetStoredProcedureParameters(string storedProcedureName)
        {
            var storedProc = "dbo.usp_Admin_GetSPParameters";
            var parms = new DynamicParameters().Parameter("@Parm_StoredProcedureName", storedProcedureName);

            var data = await ExecuteStoredProcedureAsync<SPParameterDb>(storedProc, parms);

            return data?.Select(x => new SPParameter
            {
                DataType = x.DataType,
                Length = x.ParameterLength,
                Name = x.ParameterName,
                Value = x.Value,
            }).ToArray();

        }

        public async Task<ExecuteIncidentResolutionResponse> ExecuteStoredProcedure(string kBAId, string storedProcedureName, SPParameter[] storedProcedureParameters)
        {
            var response = new ExecuteIncidentResolutionResponse { ResponseStatus = ResponseStatus.Success };
            var parms = new DynamicParameters();

            foreach (var parameter in storedProcedureParameters)
            {
                parms.Parameter(parameter.Name, parameter.Value);
            }

            try
            {
                await ExecuteNonQueryAsync(storedProcedureName, parms);
            }
            catch (Exception ex)
            {
                response.ResponseStatus = ResponseStatus.Failure;
                response.ResponseErrors.Add(new ResponseError { Message = ex.Message });
            }


            return response;
        }
    }
}
